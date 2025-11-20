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

const debouncedHandlePipe = debounce(() => handlePipe(), 50);

TerminalEvents.subscribe(debouncedHandlePipe);

// TODO-Fico : add pipe config option to script launcher to handle piping output from scripts

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
  const pipeType = PipeState.currentTerminalPipe.pipeType;

  const parsedCommand = parseCommand(commandString);
  const command = parsedCommand[0]?.toString();

  // ECHO or empty command: Pipe to stout
  if (!commandString || parsedCommand.length === 0 || command.toLowerCase() === "echo") {
    return handleEcho();
  }

  // Pipe to file
  if (hasTextExtension(command) || (hasScriptExtension(command) && pipeType !== "|")) {
    handlePipeToFile(parsedCommand, commandString);
    return TerminalEvents.emit();
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
    pipeType: pipe,
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

function advancePipe() {
  PipeState.currentTerminalPipe = PipeState.currentTerminalPipe?.nextPipe ?? null;
  PipeState.outputToBeProcessed.shift();
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

  if (PipeState.currentTerminalPipe) {
    PipeState.currentTerminalPipe.hasBeenEvaluated = true;
  }

  // If there are further pipes, pass the same output to them
  if (PipeState.currentTerminalPipe?.nextPipe) {
    PipeState.currentTerminalPipe = PipeState.currentTerminalPipe.nextPipe;
    handlePipe();
  } else {
    advancePipe();
  }
}

function writeToTextFile(filename: string) {
  const pipe = PipeState.currentTerminalPipe;
  if (!pipe) {
    return;
  }

  const file = Terminal.getTextFile(filename);
  const output = getNextOutputStringified(true).join("\n");
  const overwrite = !pipe.hasBeenEvaluated && pipe.pipeType === ">";

  if (file && !overwrite) {
    file.text += `${file.text ? "\n" : ""}${output}`;
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
  const overwrite = !pipe.hasBeenEvaluated && pipe.pipeType === ">";

  if (file && overwrite) {
    file.content = output;
  } else if (file) {
    file.content += `${file.content ? "\n" : ""}${output}`;
  } else {
    const newFile = new Script(filename as ScriptFilePath, output, Player.getCurrentServer().hostname);
    Player.getCurrentServer().scripts.set(filename as ScriptFilePath, newFile);
  }
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
