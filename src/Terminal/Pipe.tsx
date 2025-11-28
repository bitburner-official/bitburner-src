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
import { Script } from "../Script/Script";
import { LiteratureName, MessageFilename } from "@enums";
import { Messages } from "../Message/MessageHelpers";
import { Literatures } from "../Literature/Literatures";
import {
  addOutputToBeProcessed,
  getNextOutput,
  handlePipeError,
  isPipeSymbol,
  type PipedCommand,
  PipeState,
  PipeSymbols,
  queueTerminalEvent,
} from "./PipeState";
import { Settings } from "../Settings/Settings";
import { runScript } from "./commands/runScript";
import { findRunningScriptByPid } from "../Script/ScriptHelpers";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { RunningScript } from "../Script/RunningScript";

TerminalEvents.subscribe(handlePipe);

// TODO-Fico - add pipe documentation page

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

  // Pipe to file
  if (command && (hasTextExtension(command) || (hasScriptExtension(command) && pipeType !== PipeSymbols.Pipe))) {
    return handlePipeToFile(parsedCommand, commandString);
  }

  if (pipeType === PipeSymbols.OutputRedirection || pipeType === PipeSymbols.AppendOutputRedirection) {
    handlePipeError(
      `Invalid pipe symbol '${pipeType}' for command: ${commandString}. > and >> can only be used to pipe into files.`,
    );
    return;
  }

  // ECHO or empty command: Pipe to stout
  if (!commandString || parsedCommand.length === 0 || command.toLowerCase() === "echo") {
    return handleEcho();
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

  if (!parsedCommands.find(isPipeSymbol)) {
    return commandString;
  }

  PipeState.currentTerminalPipe = buildPipeChain(parsedCommands);

  return validateInputRedirectionAndUpdateFirstCommandIfNeeded(firstCommand, PipeState.currentTerminalPipe);
}

export function getCommandAfterLastPipe(commandString: string): string {
  const parsedCommands = parseCommand(commandString);
  const lastPipeIndex = parsedCommands.findLastIndex(isPipeSymbol);
  if (lastPipeIndex === -1) {
    return commandString;
  }

  return parsedCommands.slice(lastPipeIndex + 1).join(" ");
}

export function pipeContent(content: string, command: PipedCommand) {
  addOutputToBeProcessed(new Output(content, "primary"), command);
  queueTerminalEvent();
}

export function pipeMessage(message: MessageFilename, command: PipedCommand) {
  const messageDetails = Messages[message];
  const content = `${messageDetails.filename}\n${messageDetails.msg}`;

  addOutputToBeProcessed(new Output(content, "primary"), command);
  queueTerminalEvent();
}

export function pipeLiterature(message: LiteratureName, command: PipedCommand) {
  const messageDetails = Literatures[message];
  const content = `${messageDetails.filename}\n${stringify(messageDetails.text)}`;

  addOutputToBeProcessed(new Output(content, "primary"), command);
  queueTerminalEvent();
}

function buildPipeChain(parsedCommands: (string | number | boolean)[]): PipedCommand | null {
  const pipe = `${parsedCommands[0]}`;
  if (!pipe || !isPipeSymbol(pipe)) return null;

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

  while (parsedCommands.length && !isPipeSymbol(parsedCommands[0])) {
    const arg = `${parsedCommands[0]}`;
    parsedCommands.shift();
    firstCommand += arg + " ";
  }
  return firstCommand.trim();
}

function advancePipe(): void {
  if (PipeState.currentTerminalPipe) {
    PipeState.currentTerminalPipe.hasBeenEvaluated = true;
    PipeState.currentTerminalPipe = PipeState.currentTerminalPipe.nextPipe;
  }

  PipeState.outputToBeProcessed.shift();
  queueTerminalEvent();
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

  advancePipe();
}

function writeToTextFile(filename: string) {
  const pipe = PipeState.currentTerminalPipe;
  if (!pipe) {
    return;
  }

  if (pipe.pipeSymbol === PipeSymbols.Pipe) {
    handlePipeError(`Cannot pipe to text file with pipe symbol '|'. Use '>' to overwrite or '>>' to append instead.`);
    return;
  }

  const file = Terminal.getTextFile(filename);
  const output = getNextOutputStringified(true).join("\n");
  const overwrite = !pipe.hasBeenEvaluated && pipe.pipeSymbol === PipeSymbols.OutputRedirection;

  if (file && !overwrite) {
    file.content = concatenateFileContents(file.content, output);
  } else if (file && overwrite) {
    file.content = output;
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
  const overwrite = !pipe.hasBeenEvaluated && pipe.pipeSymbol === PipeSymbols.OutputRedirection;

  if (file?.content && overwrite) {
    return handlePipeError(`Overwriting existing non-empty script files is forbidden. ('${filename}').`);
  }

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

  // If the script has already been launched in a prior evaluation of the pipe chain, just add to the script's stdin
  if (currentPipe?.stdInPort) {
    writeInputToScriptStdIn(currentPipe?.stdInPort, currentInput, currentPipe);
    return advancePipe();
  }

  if (PipeState.currentTerminalPipe) {
    PipeState.currentTerminalPipe.hasBeenEvaluated = true;
    PipeState.currentTerminalPipe = PipeState.currentTerminalPipe.nextPipe;
  }

  PipeState.outputToBeProcessed.shift();
  const runningScript = runScript(scriptName as ScriptFilePath, args.slice(1), Player.getCurrentServer());
  if (!runningScript?.stdin) {
    return;
  }

  writeInputToScriptStdIn(runningScript.pid, currentInput, currentPipe);
  runningScript.temporary = true;
  currentPipe.stdInPort = runningScript.pid;
  queueTerminalEvent();
}

function writeInputToScriptStdIn(scriptPid: number | undefined, input: string[], currentPipe: PipedCommand): void {
  const script = scriptPid ? findRunningScriptByPid(scriptPid) : null;
  if (!script || !script?.stdin || scriptPid == null) {
    handlePipeError(`Cannot pipe input to script pid ${scriptPid} - script is no longer running`, currentPipe);
    return;
  }

  input.forEach((line) => {
    script.stdin?.write(line);
  });
}

function handlePipeToCat(): void {
  if (PipeState.currentTerminalPipe?.nextPipe) {
    return handleEcho();
  }
  dialogBoxCreate(getNextOutputStringified().join("\n"));
  advancePipe();
}

function validateInputRedirectionAndUpdateFirstCommandIfNeeded(
  firstCommand: string,
  pipe: PipedCommand | null,
): string {
  if (!pipe) return firstCommand;

  if (hasInputRedirection(pipe.nextPipe)) {
    handlePipeError(`Invalid pipe command. Only the first command in a pipe chain can have input redirection '<'.`);
    return firstCommand;
  }

  const firstCommandHasInputRedirection = pipe.pipeSymbol === PipeSymbols.InputRedirection;
  if (!firstCommandHasInputRedirection) return firstCommand;

  PipeState.currentTerminalPipe = {
    commandString: firstCommand,
    pipeSymbol: PipeSymbols.Pipe,
    nextPipe: pipe.nextPipe,
  };
  return `cat ${pipe.commandString}`;
}

function hasInputRedirection(pipe: PipedCommand | null): boolean {
  if (!pipe) return false;
  if (pipe.pipeSymbol === PipeSymbols.InputRedirection) return true;
  return hasInputRedirection(pipe.nextPipe);
}

function stringify(s: Output | Link | RawOutput | JSX.Element, stripAnsiEscape = false): string {
  if (!s) {
    return "";
  } else if (s instanceof Output) {
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

function getNextOutputStringified(stripAnsiEscape = false): string[] {
  return getNextOutput()?.output.map((o) => stringify(o, stripAnsiEscape)) ?? [];
}

/**
 * Ensures that pipe configurations on a saved script are properly reset when it starts up.
 * @param runningScript
 */
export function cleanUpPipesOnSavedScript(runningScript: RunningScript): void {
  if (runningScript.tailOutputPipeConfig) {
    runningScript.tailOutputPipeConfig.stdInPort = undefined;
  }
  if (runningScript.terminalOutputPipeConfig) {
    runningScript.terminalOutputPipeConfig.stdInPort = undefined;
  }
}
