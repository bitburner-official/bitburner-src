import React from "react";
import { TerminalEvents } from "./TerminalEvents";
import { renderToStaticMarkup } from "react-dom/server";
import { Terminal } from "../Terminal";
import { parseCommand } from "./Parser";
import { hasTextExtension, TextFilePath } from "../Paths/TextFilePath";
import { TextFile } from "../TextFile";
import { Player } from "@player";
import { hasScriptExtension, ScriptFilePath } from "../Paths/ScriptFilePath";
import { Link, Output, RawOutput } from "./OutputTypes";
import { ANSI_ESCAPE } from "../ui/React/ANSIITypography";
import { debounce } from "lodash";
import { Script } from "../Script/Script";
import { LiteratureName, MessageFilename } from "@enums";
import { Messages } from "../Message/MessageHelpers";
import { Literatures } from "../Literature/Literatures";
import { addOutputToBeProcessed, getNextOutput, handlePipeError, type PipedCommand, PipeState } from "./PipeState";
import { Settings } from "../Settings/Settings";
import { runScript } from "./commands/runScript";
import { findRunningScriptByPid } from "../Script/ScriptHelpers";
import { dialogBoxCreate } from "../ui/React/DialogBox";

const debouncedHandlePipe = debounce(() => handlePipe(), 50);

TerminalEvents.subscribe(debouncedHandlePipe);

// TODO-Fico - add pipe documentation page
// TODO: add unit test for multiple pipe inputs over time
// TODO: support file input with <

export function handlePipe(): void {
  const nextOutput = getNextOutput();
  const nextDestination = nextOutput?.pipeDestination;

  if (nextDestination && !PipeState.currentTerminalPipe) {
    PipeState.currentTerminalPipe = nextDestination;
  }

  if (!nextOutput || Terminal.action || !PipeState.currentTerminalPipe) {
    return;
  }

  const commandString = PipeState.currentTerminalPipe.commandString;
  const pipeType = PipeState.currentTerminalPipe.pipeSymbol;

  const parsedCommand = parseCommand(commandString);
  const command = parsedCommand[0]?.toString();

  // ECHO or empty command: Pipe to stout
  if (!commandString || parsedCommand.length === 0 || command.toLowerCase() === "echo") {
    return handleEcho();
  }

  // Pipe to file
  if (hasTextExtension(command) || (hasScriptExtension(command) && pipeType !== "|")) {
    return handlePipeToFile(parsedCommand, commandString);
  }

  const scriptFromRunCommand = getScriptFromRunCommand(parsedCommand);
  if (scriptFromRunCommand) {
    return handlePipeToScript(scriptFromRunCommand, parsedCommand, PipeState.currentTerminalPipe);
  }

  if (command.toLowerCase() === "cat") {
    return handlePipeToCat();
  }

  // Pipe to the next terminal command
  const output = getNextOutput()
    ?.output.map((o) => stringify(o))
    .join("\n")
    .replaceAll('"', "'");
  advancePipe();

  const nextCommand = `${parsedCommand[0]}`.trim().toLowerCase();
  const useQuotes = nextCommand === "grep";
  const newCommand = `${commandString} ${useQuotes ? '"' : ""}${output}${useQuotes ? '"' : ""}`;
  Terminal.executeCommand(newCommand);
}

export function splitPipesFromFirstCommand(commandString: string): string {
  if (PipeState.currentTerminalPipe) {
    return commandString;
  }

  const parsedCommands = parseCommand(commandString);
  const firstCommand = getFirstCommand(parsedCommands);

  if (!parsedCommands.find((arg) => `${arg}`.match(pipeMatcher()))) {
    return commandString;
  }

  PipeState.currentTerminalPipe = buildPipeChain(parsedCommands);

  return firstCommand;
}

export function pipeContent(content: string, command: PipedCommand) {
  addOutputToBeProcessed(new Output(content, "primary"), command);
  TerminalEvents.emit();
}

export function pipeMessage(message: MessageFilename, command: PipedCommand) {
  const messageDetails = Messages[message];
  const content = `${messageDetails.filename}\n${messageDetails.msg}`;

  addOutputToBeProcessed(new Output(content, "primary"), command);
  TerminalEvents.emit();
}

export function pipeLiterature(message: LiteratureName, command: PipedCommand) {
  const messageDetails = Literatures[message];
  const content = `${messageDetails.filename}\n${stringify(messageDetails.text)}`;

  addOutputToBeProcessed(new Output(content, "primary"), command);
  TerminalEvents.emit();
}

function buildPipeChain(parsedCommands: (string | number | boolean)[]): PipedCommand | null {
  const pipe = `${parsedCommands[0]}`;
  if (!pipe || !pipe.match(pipeMatcher())) return null;

  parsedCommands.shift();
  const nextCommand = getFirstCommand(parsedCommands);

  return {
    commandString: nextCommand,
    pipeSymbol: pipe,
    nextPipe: buildPipeChain(parsedCommands),
  };
}

function getFirstCommand(parsedCommands: (string | number | boolean)[]): string {
  let firstCommand = "";

  while (parsedCommands.length && !pipeMatcher().test(`${parsedCommands[0]}`)) {
    const arg = `${parsedCommands[0]}`;
    parsedCommands.shift();
    firstCommand += arg + " ";
  }
  return firstCommand.trim();
}

function advancePipe(shiftOutput = true): void {
  if (PipeState.currentTerminalPipe) {
    PipeState.currentTerminalPipe.hasBeenEvaluated = true;
    PipeState.currentTerminalPipe = PipeState.currentTerminalPipe.nextPipe;
  }

  if (shiftOutput) {
    PipeState.outputToBeProcessed.shift();
  }
  TerminalEvents.emit();
}

function handleEcho(): void {
  if (PipeState.currentTerminalPipe?.nextPipe) {
    PipeState.currentTerminalPipe = PipeState.currentTerminalPipe.nextPipe;
    handlePipe();
    return;
  }

  const output = getNextOutput()?.output ?? [];
  Terminal.outputHistory.push(...output);
  advancePipe();
}

function handlePipeToFile(parsedCommand: (string | number | boolean)[], commandString: string): void {
  if (parsedCommand.length > 1) {
    handlePipeError(
      `Invalid pipe to file command: ${commandString} . Only a single file can be specified; no flags are supported.`,
    );
    return;
  }
  const command = parsedCommand[0].toString();

  if (hasTextExtension(command)) {
    writeToTextFile(command);
  } else if (hasScriptExtension(command)) {
    writeToScriptFile(command);
  } else {
    handlePipeError(`Invalid file extension for pipe to file command: ${command}`);
    return;
  }

  advancePipe(false);
}

function writeToTextFile(filename: string) {
  const pipe = PipeState.currentTerminalPipe;
  if (!pipe) {
    return;
  }

  const file = Terminal.getTextFile(filename);
  const output = getNextOutputStringified(true).join("\n");
  const overwrite = !pipe.hasBeenEvaluated && pipe.pipeSymbol === ">";

  if (file && !overwrite) {
    file.text = concatenateFileContents(file.text, output);
  } else if (file && overwrite) {
    file.text = output;
  } else {
    const newFile = new TextFile(filename as TextFilePath, output);
    Player.getCurrentServer().textFiles.set(filename as TextFilePath, newFile);
  }
}

function writeToScriptFile(filename: string): void {
  const pipe = PipeState.currentTerminalPipe;
  if (!pipe) {
    return;
  }

  const file = Terminal.getScript(filename);
  const output = getNextOutputStringified(true).join("\n");
  const overwrite = !pipe.hasBeenEvaluated && pipe.pipeSymbol === ">";

  if (file && overwrite) {
    file.content = output;
  } else if (file) {
    file.content = concatenateFileContents(file.content, output);
  } else {
    const newFile = new Script(filename as ScriptFilePath, output, Player.getCurrentServer().hostname);
    Player.getCurrentServer().scripts.set(filename as ScriptFilePath, newFile);
  }
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

function getScriptFromRunCommand(parsedCommand: (string | number | boolean)[]): string {
  if (hasScriptExtension(`${parsedCommand[0]}`)) {
    return `${parsedCommand[0]}`;
  }
  if (
    parsedCommand.length > 1 &&
    `${parsedCommand[0]}`.toLowerCase() === "run" &&
    hasScriptExtension(`${parsedCommand[1]}`)
  ) {
    return `${parsedCommand[1]}`;
  }
  return "";
}

function handlePipeToScript(
  scriptName: string,
  parsedCommand: (string | number | boolean)[],
  currentPipe: PipedCommand,
): void {
  const args = parsedCommand[0].toString().toLowerCase() === "run" ? parsedCommand.slice(1) : parsedCommand;
  const currentInput = getNextOutputStringified();

  // If the script has already been launched in a prior evaluation of the pipe chain, just add to the script's stdIn
  if (PipeState.currentTerminalPipe?.stdInPort) {
    const existingScript = findRunningScriptByPid(+PipeState.currentTerminalPipe?.stdInPort);
    return writeInputToScriptStdIn(existingScript?.pid ?? 0, currentInput);
  }

  // Prep the output for the next pipe and launch the script
  PipeState.currentTerminalPipe = PipeState.currentTerminalPipe?.nextPipe ?? null;
  PipeState.outputToBeProcessed.shift();
  const runningScript = runScript(scriptName as ScriptFilePath, args, Player.getCurrentServer());

  if (!runningScript?.stdIn) {
    return;
  }

  writeInputToScriptStdIn(runningScript?.pid ?? 0, currentInput);
  currentPipe.stdInPort = runningScript.pid * -1;
  TerminalEvents.emit();
}

function writeInputToScriptStdIn(scriptPid: number, input: string[]): void {
  const script = findRunningScriptByPid(scriptPid);
  if (!script?.stdIn) {
    handlePipeError(`Cannot pipe input to script pid ${scriptPid} - script is no longer running`);
    return;
  }

  input.forEach((line) => {
    script.stdIn?.write(line);
  });
}

function handlePipeToCat(): void {
  dialogBoxCreate(getNextOutputStringified().join("\n"));
  advancePipe(false);
}

function stringify(s: Output | Link | RawOutput | JSX.Element, stripAnsiEscape = false): string {
  if (s instanceof Output) {
    return stripAnsiEscape ? s.text.replaceAll(ANSI_ESCAPE, "") : s.text;
  } else if (s instanceof Link) {
    return `${s.dashes} ${s.hostname}`;
  } else {
    const markup = renderToStaticMarkup(<>{s instanceof RawOutput ? s.raw : s}</>);
    const div = document.createElement("div");
    div.innerHTML = markup.replaceAll(">", "> ");
    return div.textContent ?? div.innerText ?? "";
  }
}

function pipeMatcher(): RegExp {
  return /^(>>)|[|>]$/g;
}

function getNextOutputStringified(stripAnsiEscape = false): string[] {
  return getNextOutput()?.output.map((o) => stringify(o, stripAnsiEscape)) ?? [];
}
