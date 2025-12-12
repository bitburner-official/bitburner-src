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
import { Settings } from "../../Settings/Settings";

// TODO-Fico - add pipe documentation page

type Args = string | number | boolean;

export function parseRedirectedCommands(commandString: string) {
  const parsed = parseCommand(commandString);
  const commandSets = findCommandsSplitByRedirects(parsed);
  if (commandSets.length <= 1) {
    return Terminal.executeCommand(commandString, getTerminalStdIO(null));
  }

  let priorStdIO: StdIO | null = new StdIO(null);
  for (const commandSet of commandSets) {
    handleCommand(priorStdIO, commandSet);
    priorStdIO = new StdIO(priorStdIO.stdout);
  }
  // Redirect last command's stdout to terminal
  // TODO-Fico: this isnt working?
  priorStdIO.stdout?.close();
  priorStdIO.stdout = null;
  return true;
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

  Terminal.executeCommand([command, ...args].join(" "), stdIO);
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
  stdIO.write(argList.join(" "));
  stdIO.close();
}

export function getTerminalStdIO(stdin: IOStream | null = null) {
  return new StdIO(stdin, null);
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
  stdIO.stdout?.close();

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
    currentFile.content = concatenateFileContents(currentFile.content, output)
  });
}

function writeToScriptFile(filename: string, pipeType: string, stdIO: StdIO): void {
  const overwrite = pipeType === PipeSymbols.OutputRedirection;

  void callOnRead(stdIO, (data: unknown) => {
    let file = Terminal.getScript(filename);
    if (!file) {
      file = new Script(filename as ScriptFilePath, "", Player.getCurrentServer().hostname);
      Player.getCurrentServer().scripts.set(filename as ScriptFilePath, file)
    }
    if (file?.content && overwrite) {
      return handleIoError(
        stdIO,
        `Overwriting non-empty script files is forbidden. Attempted to overwrite ${filename}.`,
      );
    }
    const output = stringify(data);
    file.content = concatenateFileContents(file.content, output);
  });
}

export async function callOnRead(stdIO: StdIO, callback: (data: unknown, stout: IOStream) => Promise<void> | void) {
  for await (const data of stdIO.read()) {
    const streamIsCleared = stdIO.stdin?.deref()?.isClosed && stdIO.stdin?.deref()?.empty();
    if (data === DATA_STREAM_CLOSED || streamIsCleared || !stdIO.stdout) {
      return;
    }
    await callback(data, stdIO.stdout);
  }
}

function handleIoError(stdIO: StdIO, error: string) {
  Terminal.error(error, stdIO);
}

function concatenateFileContents(content: string, newContent: string): string {
  const concatenatedContent = content + (content ? "\n" : "") + newContent;
  const splitLines = concatenatedContent.split("\n");
  if (splitLines.length > Settings.MaxTerminalCapacity * 5) {
    const truncatedFileContent = splitLines.slice(-Settings.MaxTerminalCapacity * 5).join("\n");
    return `(File truncated at ${Settings.MaxTerminalCapacity * 5} lines)\n${truncatedFileContent}`;
  }

  return concatenatedContent;
}

export function stringify(s: unknown, stripAnsiEscape = false): string {
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
    return s.toString().replaceAll(ANSI_ESCAPE, "");
  } else {
    return JSON.stringify(s).replaceAll(ANSI_ESCAPE, "");
  }
}
