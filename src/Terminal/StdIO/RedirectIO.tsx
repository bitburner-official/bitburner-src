import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseCommand } from "../Parser";
import { isPipeSymbol, PipeSymbols } from "../PipeState";
import { DATA_STREAM_CLOSED, IOStream } from "./IOStream";
import { StdIO } from "./StdIO";
import { Link, Output, RawOutput } from "../OutputTypes";
import { ANSI_ESCAPE } from "../../ui/React/ANSIITypography";
import { Terminal } from "../../Terminal";
import { hasTextExtension, TextFilePath } from "../../Paths/TextFilePath";
import { hasScriptExtension, ScriptFilePath } from "../../Paths/ScriptFilePath";
import { TextFile } from "../../TextFile";
import { Player } from "@player";
import { Script } from "../../Script/Script";

type Args = string | number | boolean;

export function parseRedirectedCommands(commandString: string) {
  const parsed = parseCommand(commandString);
  const commandSets = findCommandsSplitByRedirects(parsed);
  if (commandSets.length <= 1) {
    return null;
  }
  let priorStdIO: StdIO | null = new StdIO(null);
  for (const commandSet of commandSets) {
    handleCommand(priorStdIO, commandSet);
    priorStdIO = new StdIO(priorStdIO.stdout);
  }
  getTerminalStdIO(priorStdIO.stdout);
}

export function handleCommand(stdIO: StdIO, commandStrings: Args[], hasOutputPipe = true) {
  const pipeSymbol = isPipeSymbol(commandStrings[0]) ? `${commandStrings[0]}` : null;
  const command = `${pipeSymbol ? commandStrings[1] : commandStrings[0]}`;
  const args = pipeSymbol ? commandStrings.slice(2) : commandStrings.slice(1);

  if (!command) {
    return handleIoError(stdIO, `Invalid command string: no command found after output redirect ${pipeSymbol}.`);
  }

  // Pipe to file
  if (command && (hasTextExtension(command) || (hasScriptExtension(command) && pipeSymbol !== PipeSymbols.Pipe))) {
    return handlePipeToFile(command, pipeSymbol, stdIO);
  }

  // > and >> are invalid pipes for commands that are not piping to files
  if (pipeSymbol === PipeSymbols.OutputRedirection || pipeSymbol === PipeSymbols.AppendOutputRedirection) {
    return handleIoError(
      stdIO,
      `Invalid pipe symbol '${pipeSymbol}' for command: ${command}. > and >> can only be used to pipe into files.`,
    );
  }

  // Echo arguments to pipes
  if (command === "echo") {
    return handleEcho(args, stdIO);
  }

  if (command === "cat") {
    return handleCat(args, stdIO, hasOutputPipe);
  }
}

export function findCommandsSplitByRedirects(commands: Args[]) {
  const result: Args[][] = [];
  let currentCommand: Args[] = [];
  for (const token of commands) {
    if (isPipeSymbol(token)) {
      result.push(currentCommand);
      currentCommand = [token];
    } else {
      currentCommand.push(token);
    }
  }
  result.push(currentCommand);
  return result;
}

function handleEcho(argList: Args[], stdIO: StdIO): void {
  stdIO.stdout.write(argList.join(" "));
  stdIO.stdout.close();
  stdIO.stdin?.deref()?.close();
}

export function getTerminalStdIO(stdin: IOStream) {
  const stdIO = new StdIO(stdin);
  stdIO.stdout.close();

  void startTerminalOutputStream(stdIO);

  return stdIO;
}

function handleCat(argList: Args[], stdIO: StdIO, hasOutputPipe: boolean): void {
  if (!hasOutputPipe) {
    // TODO: implement live cat window
    return handleIoError(stdIO, `cat tail window is not yet implemented.`);
  }

  // TODO: call cat
  // TODO: get output stream from cat
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
  stdIO.stdout.close();

  if (hasTextExtension(fileName)) {
    writeToTextFile(fileName, pipeType, stdIO);
  } else if (hasScriptExtension(fileName)) {
    writeToScriptFile(fileName, pipeType, stdIO);
  } else {
    return handleIoError(stdIO, `Invalid file extension for piping to file: ${fileName}.`);
  }
}

function writeToTextFile(filename: string, pipeType: string, stdIO: StdIO) {
  let file = Terminal.getTextFile(filename);
  const overwrite = pipeType === PipeSymbols.OutputRedirection;

  if (!file) {
    file = new TextFile(filename as TextFilePath, "");
    Player.getCurrentServer().textFiles.set(filename as TextFilePath, file);
  }

  if (file?.content && overwrite) {
    file.content = "";
  }

  void callOnRead(stdIO, (data: unknown) => {
    const currentFile = Terminal.getTextFile(filename);
    if (!currentFile) {
      return;
    }
    const output = stringify(data);
    if (currentFile.content) {
      currentFile.content += "\n";
    }
    currentFile.content += output;
  });
}

function writeToScriptFile(filename: string, pipeType: string, stdIO: StdIO): void {
  let file = Terminal.getScript(filename);
  const overwrite = pipeType === PipeSymbols.OutputRedirection;

  if (!file) {
    file = new Script(filename as ScriptFilePath, "");
    Player.getCurrentServer().scripts.set(filename as ScriptFilePath, file);
  }

  void callOnRead(stdIO, (data: unknown) => {
    const currentFile = Terminal.getScript(filename);
    if (!currentFile) {
      return;
    }
    if (file?.content && overwrite) {
      return handleIoError(
        stdIO,
        `Overwriting non-empty script files is forbidden. Attempted to overwrite ${filename}.`,
      );
    }
    const output = stringify(data);
    if (currentFile.content) {
      currentFile.content += "\n";
    }
    currentFile.content += output;
  });
}

async function startTerminalOutputStream(stdio: StdIO) {
  return callOnRead(stdio, (data: unknown) => {
    if (data instanceof Output || data instanceof Link || data instanceof RawOutput) {
      Terminal.terminalOutput(data);
    } else {
      Terminal.printAndBypassPipes(stringify(data));
    }
  });
}

export async function callOnRead(stdio: StdIO, callback: (data: unknown, stout: IOStream) => Promise<void> | void) {
  for await (const data of stdio.read()) {
    const streamIsCleared = stdio.stdin?.deref()?.isClosed && stdio.stdin?.deref()?.empty();
    if (data === DATA_STREAM_CLOSED || streamIsCleared) {
      return;
    }
    await callback(data, stdio.stdout);
  }
}

function handleIoError(stdio: StdIO, error: string) {
  stdio.stdout.close();
  stdio.stdin?.deref()?.close();
  Terminal.error(error);
}

function stringify(s: unknown, stripAnsiEscape = false): string {
  if (!s) {
    return "";
  } else if (s instanceof Output) {
    return stripAnsiEscape ? s.text.replaceAll(ANSI_ESCAPE, "") : s.text;
  } else if (s instanceof Link) {
    return `${s.dashes} ${s.hostname}`;
  } else if (s instanceof RawOutput) {
    // TODO: test
    const markup = renderToStaticMarkup(<>{s.raw}</>);
    const div = document.createElement("div");
    div.innerHTML = markup.replaceAll(">", "> ");
    return div.textContent ?? div.innerText ?? "";
  } else if (typeof s === "string" || typeof s === "number" || typeof s === "boolean") {
    return s.toString();
  } else {
    return JSON.stringify(s);
  }
}
