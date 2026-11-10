import { parseCommand } from "../Parser";
import { trimQuotes } from "../../utils/helpers/string";
import { IOStream } from "./IOStream";
import { StdIO } from "./StdIO";
import { Terminal } from "../../Terminal";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { hasScriptExtension, resolveScriptFilePath } from "../../Paths/ScriptFilePath";
import { Player } from "@player";
import { Args, isPipeSymbol, PipeSymbols, stringify } from "./utils";
import { sleep } from "../../utils/Utility";

export async function parseRedirectedCommands(commandString: string) {
  const parsed = parseCommand(commandString, false);
  const commandSets = findCommandsSplitByRedirects(parsed);
  if (!commandSets.length) return;
  if (commandSets.length === 1) {
    return Terminal.executeCommand(commandString, getTerminalStdIO());
  }

  const stdIOChain = buildStdIOChain(commandSets.length);
  const openPipes: Promise<void>[] = [];
  let longRunningCommandUsed = false;
  for (let i = 0; i < commandSets.length; i++) {
    const commandSet = commandSets[i];
    const stdIO = stdIOChain[i];
    await handleCommand(stdIO, commandSet);
    longRunningCommandUsed ||= isLongRunningCommand(commandSet);
    openPipes.push(longRunningCommandUsed ? sleep(0) : waitUntilClosed(stdIO));
  }

  // Allow the IO chain to pass data through its async iterators
  await Promise.all(openPipes);
}

export async function handleCommand(stdIO: StdIO, commandStrings: Args[]) {
  const pipeSymbol = isPipeSymbol(commandStrings[0]) ? `${commandStrings[0]}` : null;
  const rawCommand = pipeSymbol ? commandStrings[1] : commandStrings[0];
  const args = pipeSymbol ? commandStrings.slice(2) : commandStrings.slice(1);

  if (rawCommand === undefined) {
    return handleIoError(stdIO, `Invalid command string: no command found after output redirect ${pipeSymbol}.`);
  }
  const command = trimQuotes(`${rawCommand}`);

  // Pipe to file
  if (hasTextExtension(command) || (hasScriptExtension(command) && pipeSymbol && pipeSymbol !== PipeSymbols.Pipe)) {
    return handlePipeToFile(command, pipeSymbol, stdIO);
  }

  // > and >> are invalid pipes for commands that are not piping to files
  if (pipeSymbol === PipeSymbols.OutputRedirection || pipeSymbol === PipeSymbols.AppendOutputRedirection) {
    return handleIoError(
      stdIO,
      `Invalid pipe symbol '${pipeSymbol}' for command: ${command}. > and >> can only be used to pipe into files.`,
    );
  }
  await Terminal.executeCommand([rawCommand, ...args].join(" "), stdIO);
}

export function buildStdIOChain(length: number, initialStdIO: StdIO | null = null): StdIO[] {
  const stdIOs: StdIO[] = [];
  let priorStdIO = initialStdIO;

  for (let i = 0; i < length; i++) {
    const newStdIO = new StdIO(priorStdIO?.stdout ?? null);
    stdIOs.push(newStdIO);
    priorStdIO = newStdIO;
  }
  stdIOs[stdIOs.length - 1].stdout = null; // Last StdIO writes to terminal

  return stdIOs;
}

export function findCommandsSplitByRedirects(commands: Args[]) {
  const result: Args[][] = [];
  let currentCommand: Args[] = [];
  for (const token of commands) {
    if (isPipeSymbol(token) && currentCommand.length) {
      result.push(currentCommand);
      currentCommand = [token];
    } else {
      currentCommand.push(token);
    }
  }
  result.push(currentCommand);

  for (const [index, commandGroup] of result.entries()) {
    if (index !== 1 && commandGroup[0] === PipeSymbols.InputRedirection) {
      handleIoError(
        getTerminalStdIO(),
        `Error in pipe command: Input redirection '<' can only be used after the first pipe command.`,
      );
      return [];
    }
  }

  // If the second command starts with an input redirection, convert it to a simple pipe.
  if (result[1]?.[0] === PipeSymbols.InputRedirection) {
    const inputRedirectCommand = result.splice(1, 1)[0];
    result.unshift(["cat", ...inputRedirectCommand.slice(1)]);
    result[1].unshift(PipeSymbols.Pipe);
  }

  return result;
}

export function getTerminalStdIO(stdin: IOStream | null = null) {
  return new StdIO(stdin, null);
}

function handlePipeToFile(fileName: string, pipeType: string | null, stdIO: StdIO) {
  if (!pipeType) {
    return handleIoError(stdIO, `Invalid command string: no pipe symbol found for piping to file ${fileName}.`);
  }
  if (pipeType !== PipeSymbols.OutputRedirection && pipeType !== PipeSymbols.AppendOutputRedirection) {
    return handleIoError(
      stdIO,
      `Invalid pipe symbol '${pipeType}' for piping to file ${fileName}. Only > and >> are allowed.`,
    );
  }

  // No output from writing to files
  stdIO.stdout?.close();

  if (!hasTextExtension(fileName) && !hasScriptExtension(fileName)) {
    return handleIoError(stdIO, `Invalid file extension for piping to file: ${fileName}`);
  }
  writeToContentFile(fileName, pipeType, stdIO);
}

function writeToContentFile(filename: string, pipeType: string, stdIO: StdIO): void {
  const server = Player.getCurrentServer();
  const filePath = Terminal.getFilepath(filename);
  if (!filePath || (!hasTextExtension(filePath) && !hasScriptExtension(filePath))) {
    return handleIoError(stdIO, `Invalid file path provided: ${filename}`);
  }
  if (!server.getContentFile(filePath)) {
    server.writeToContentFile(filePath, "");
  }
  const file = server.getContentFile(filePath);
  if (!file) {
    return handleIoError(stdIO, `Failed to create file for piping output: ${filePath}`);
  }

  if (pipeType === PipeSymbols.OutputRedirection) {
    file.content = "";
  }

  void callOnRead(stdIO, (data: unknown) => {
    const currentFile = server.getContentFile(filePath);
    if (!currentFile) {
      return;
    }
    const content = currentFile.content;
    currentFile.content = content + (content ? "\n" : "") + stringify(data);
  });
}

export async function callOnRead(stdIO: StdIO, callback: (data: unknown, stdIO: StdIO) => Promise<void> | void) {
  try {
    for await (const data of stdIO.read()) {
      const streamIsCleared = stdIO.stdin?.deref()?.isClosed && stdIO.stdin?.deref()?.empty();
      if (data === null || streamIsCleared) {
        return;
      }
      await callback(data, stdIO);
    }
  } finally {
    stdIO.close();
  }
}

function handleIoError(stdIO: StdIO, error: string) {
  Terminal.fatal(error, stdIO);
}

export function isLongRunningCommand(commandSet: Args[]) {
  const pipeSymbol = isPipeSymbol(commandSet[0]) ? `${commandSet[0]}` : null;
  const command = trimQuotes(`${pipeSymbol ? commandSet[1] : commandSet[0]}`).toLowerCase();
  return ["tail", "run", "cat", "grep", "rm"].includes(command) || !!resolveScriptFilePath(command);
}

async function waitUntilClosed(stdio: StdIO): Promise<void> {
  while (stdio.stdout && !stdio.stdout?.isClosed) {
    await stdio.stdout.nextWrite();
  }
}
