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
  type RedirectedCommand,
  PipeState,
  PipeSymbols,
} from "./PipeState";
import { Settings } from "../Settings/Settings";
import { findRunningScriptByPid } from "../Script/ScriptHelpers";
import { RunningScript } from "../Script/RunningScript";
import { PortHandle, PortNumber } from "../NetscriptPort";
import { getTerminalStdIO } from "./StdIO/RedirectIO";


/*
- new class StdIO - stdin, stdout, onRead
- read loop `for await (const line of stdin.readLines()) {`

- new porthandle wrapper - closed state, close() function
- pusher calls close()

StdIO should always be constructed for terminal commands (no null). A default one has a closed stdin and stdout -> terminal
StdIO has separated open/closed state for stdin and stdout
print to closed stdout is a noop
Required argument to Terminal.print
weakref to your stdin

by closing the stream, it causes the next thing in the chain to be able to exit, instead of just waiting


- handle wget

- pipes should send stdout through the chain

- pipes should live until all output is clean and all scripts are done

- cat should be a tail window
- Cat should concatenate multiple inputs: "-" is stdin, use stdin if no args are present

cut? https://www.geeksforgeeks.org/linux-unix/cut-command-linux-examples/
sed? https://www.geeksforgeeks.org/linux-unix/sed-command-in-linux-unix-with-examples/
 */

export function handlePipe(): void {
  const nextOutput = getNextOutput();
  const nextDestination = nextOutput?.redirectDestination;

  if (nextDestination && !PipeState.currentTerminalPipe) {
    PipeState.currentTerminalPipe = nextDestination;
  }

  if (!nextOutput || Terminal.action || !PipeState.currentTerminalPipe) {
    return;
  }

  const commandString = PipeState.currentTerminalPipe.commandString;
  const pipeType = PipeState.currentTerminalPipe.pipeSymbol;

  const parsedCommand = parseCommand(commandString);
  const command = `${parsedCommand[0]}`.trim().toLowerCase();

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

  // echo, cat, or empty command: Pipe to stout
  if (
    !commandString ||
    parsedCommand.length === 0 ||
    command === "echo" ||
    command === "cat" // todo: implement cat tail window
  ) {
    return handleEcho();
  }

  const scriptFromRunCommand = getScriptFromRunCommand(parsedCommand);
  if (scriptFromRunCommand) {
    return handlePipeToScript(scriptFromRunCommand, parsedCommand, PipeState.currentTerminalPipe);
  }

  if (command === "grep") {
    return handleGrep(commandString);
  }

  // All other commands ignore stdin
  Terminal.executeCommand(commandString, getTerminalStdIO(null));
}

export function buildRedirectedCommandChain(commandString: string): boolean {
  const parsedCommands = parseCommand(commandString);
  const firstCommand = getFirstCommand(parsedCommands);

  if (!parsedCommands.find(isPipeSymbol)) {
    return false;
  }

  const pipeRoot: RedirectedCommand = {
    commandString: firstCommand,
    stdin: getNextStdinHandle(),
    pipeSymbol: "",
    nextPipe: buildPipeChain(parsedCommands),
  };

  const updatedPipe = validateInputRedirectionAndConvertToCat(pipeRoot);
  if (!updatedPipe) {
    return true;
  }

  PipeState.currentRedirects.unshift(updatedPipe);
  TerminalEvents.emit();
  return true;
}

export function getCommandAfterLastPipe(commandString: string): string {
  const parsedCommands = parseCommand(commandString);
  const lastPipeIndex = parsedCommands.findLastIndex(isPipeSymbol);
  if (lastPipeIndex === -1) {
    return commandString;
  }

  return parsedCommands.slice(lastPipeIndex + 1).join(" ");
}

export function pipeContent(content: string, command: RedirectedCommand) {
  addOutputToBeProcessed(new Output(content, "primary"), command);
  TerminalEvents.emit();
}

export function pipeMessage(message: MessageFilename, command: RedirectedCommand) {
  const messageDetails = Messages[message];
  const content = `${messageDetails.filename}\n${messageDetails.msg}`;

  addOutputToBeProcessed(new Output(content, "primary"), command);
  TerminalEvents.emit();
}

export function pipeLiterature(message: LiteratureName, command: RedirectedCommand) {
  const messageDetails = Literatures[message];
  const content = `${messageDetails.filename}\n${stringify(messageDetails.text)}`;

  addOutputToBeProcessed(new Output(content, "primary"), command);
  TerminalEvents.emit();
}

function buildPipeChain(parsedCommands: (string | number | boolean)[]): RedirectedCommand | null {
  const pipe = `${parsedCommands[0]}`;
  if (!pipe || !isPipeSymbol(pipe)) return null;

  parsedCommands.shift();
  const nextCommand = getFirstCommand(parsedCommands);

  return {
    commandString: nextCommand,
    pipeSymbol: pipe,
    nextPipe: buildPipeChain(parsedCommands),
    stdin: getNextStdinHandle(),
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
  TerminalEvents.emit();
}

function handleEcho(): void {
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
  currentPipe: RedirectedCommand,
): void {
  //const args = parsedCommand[0].toString().toLowerCase() === "run" ? parsedCommand.slice(1) : parsedCommand;
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
  //const runningScript = runScript(scriptName as ScriptFilePath, args.slice(1), Player.getCurrentServer());
  // if (!runningScript?.stdin) {
  //   return;
  // }
  //
  // writeInputToScriptStdIn(runningScript.pid, currentInput, currentPipe);
  // runningScript.temporary = true;
  // currentPipe.stdInPort = runningScript.pid;
  // TerminalEvents.emit();
}

function writeInputToScriptStdIn(scriptPid: number | undefined, input: string[], currentPipe: RedirectedCommand): void {
  const script = scriptPid ? findRunningScriptByPid(scriptPid) : null;
  if (!script || !script?.stdin || scriptPid == null) {
    handlePipeError(`Cannot pipe input to script pid ${scriptPid} - script is no longer running`, currentPipe);
    return;
  }

  input.forEach((line) => {
    script.stdin?.write(line);
  });
}

function handleGrep(commandString: string) {
  const output = getNextOutput()
    ?.output.map((o) => stringify(o))
    .join("\n")
    .replaceAll('"', "'");
  advancePipe();

  const newCommand = `${commandString} "${output}"`;
  Terminal.executeCommand(newCommand, getTerminalStdIO(null));
}

// TODO: document
function validateInputRedirectionAndConvertToCat(pipe: RedirectedCommand | null): RedirectedCommand | null {
  if (!pipe) return pipe;

  if (hasInputRedirection(pipe.nextPipe?.nextPipe)) {
    handlePipeError(`Invalid pipe command. Only the first command in a pipe chain can have input redirection '<'.`);
    return null;
  }

  const firstCommandHasInputRedirection = pipe.pipeSymbol === PipeSymbols.InputRedirection;
  if (!firstCommandHasInputRedirection) return pipe;

  return {
    commandString: `cat ${pipe.commandString}`,
    pipeSymbol: PipeSymbols.Pipe,
    nextPipe: pipe.nextPipe?.nextPipe ?? null,
    stdin: getNextStdinHandle(),
  };
}

function hasInputRedirection(pipe: RedirectedCommand | null | undefined): boolean {
  if (!pipe) return false;
  if (pipe.pipeSymbol === PipeSymbols.InputRedirection) return true;
  return hasInputRedirection(pipe.nextPipe);
}

export function getNextStdinHandle(): PortHandle {
  return new PortHandle((++PipeState.nextStdinPort * -1) as PortNumber);
}

function stringify(s: unknown, stripAnsiEscape = false): string {
  if (!s) {
    return "";
  } else if (s instanceof Output) {
    return stripAnsiEscape ? s.text.replaceAll(ANSI_ESCAPE, "") : s.text;
  } else if (s instanceof Link) {
    return `${s.dashes} ${s.hostname}`;
  } else if (s instanceof Element) {
    // TODO: test
    const markup = renderToStaticMarkup(<>{s instanceof RawOutput ? s.raw : s}</>);
    const div = document.createElement("div");
    div.innerHTML = markup.replaceAll(">", "> ");
    return div.textContent ?? div.innerText ?? "";
  } else {
    return JSON.stringify(s);
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
