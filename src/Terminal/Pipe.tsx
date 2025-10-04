import React from "react";
import { TerminalEvents } from "./TerminalEvents";
import { renderToStaticMarkup } from "react-dom/server";
import { Terminal } from "../Terminal";
import { parseCommand } from "./Parser";
import { hasTextExtension, TextFilePath } from "../Paths/TextFilePath";
import { TextFile } from "../TextFile";
import { Player } from "@player";
import { hasScriptExtension, ScriptFilePath } from "../Paths/ScriptFilePath";
import { runScript } from "./commands/runScript";
import { Link, Output, RawOutput } from "./OutputTypes";
import { ANSI_ESCAPE } from "../ui/React/ANSIITypography";
import { debounce } from "lodash";
import { Script } from "../Script/Script";
import { LiteratureName, MessageFilename } from "@enums";
import { Messages } from "../Message/MessageHelpers";
import { Literatures } from "../Literature/Literatures";

const debouncedHandlePipe = debounce(() => handlePipe(), 50);

TerminalEvents.subscribe(debouncedHandlePipe);

function handlePipe(): void {
  // TODO: handle pipes from scripts

  if (Terminal.outputToBeProcessed.length === 0 || Terminal.action || !Terminal.currentTerminalPipe) {
    return;
  }

  const commandString = Terminal.currentTerminalPipe.commandString;
  const currentPipe = Terminal.currentTerminalPipe.pipeType;

  const parsedCommand = parseCommand(commandString);
  const command = parsedCommand[0]?.toString();

  // ECHO or empty command: Pipe to stout
  if (!commandString || parsedCommand.length === 0 || command.toLowerCase() === "echo") {
    return handleEcho();
  }

  // Pipe to file
  if (hasTextExtension(command) || (hasScriptExtension(command) && currentPipe !== "|")) {
    handlePipeToFile(parsedCommand, commandString);
    return TerminalEvents.emit();
  }

  // TODO: test piping to script - should it live here or in runScript?
  // TODO: implement piping out of script - pid in tprint through append
  if (hasScriptExtension(command)) {
    handlePipeToScript(parsedCommand);
    return TerminalEvents.emit();
  }

  // Pipe to the next terminal command
  const output = Terminal.outputToBeProcessed
    .map((o) => stringify(o))
    .join("\n")
    .replaceAll('"', "'");
  advancePipe();
  Terminal.executeCommand(`${commandString} "${output}"`);
}

export function splitPipesFromFirstCommand(commandString: string): string {
  if (Terminal.currentTerminalPipe) {
    return commandString;
  }

  const parsedCommands = parseCommand(commandString);
  const firstCommand = getFirstCommand(parsedCommands);

  if (!parsedCommands.find(arg => `${arg}`.match(pipeMatcher()))) {
    return commandString;
  }

  Terminal.currentTerminalPipe = buildPipeChain(parsedCommands);

  return firstCommand;
}

export function pipeContent(content: string) {
  if (!Terminal.currentTerminalPipe) {
    return;
  }

  Terminal.outputToBeProcessed.push(new Output(content, "primary"));
  TerminalEvents.emit();
}

export function pipeMessage(message: MessageFilename) {
  if (!Terminal.currentTerminalPipe) {
    return;
  }
  const messageDetails = Messages[message];
  const content = `${messageDetails.filename}\n${messageDetails.msg}`;

  Terminal.outputToBeProcessed.push(new Output(content, "primary"));
  TerminalEvents.emit();
}

export function pipeLiterature(message: LiteratureName) {
  if (!Terminal.currentTerminalPipe) {
    return;
  }
  const messageDetails = Literatures[message];
  const content = `${messageDetails.filename}\n${stringify(messageDetails.text)}`;

  Terminal.outputToBeProcessed.push(new Output(content, "primary"));
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

function handlePipeError(error: string) {
  Terminal.outputToBeProcessed.length = 0;
  Terminal.currentTerminalPipe = null;
  Terminal.error(`Error in pipe command: ${error}`);
}

function advancePipe() {
  Terminal.currentTerminalPipe = Terminal.currentTerminalPipe?.nextPipe ?? null;
  Terminal.outputToBeProcessed.length = 0;
  TerminalEvents.emit();
}

function handleEcho(): void {
  if (Terminal.currentTerminalPipe?.nextPipe) {
    Terminal.currentTerminalPipe = Terminal.currentTerminalPipe.nextPipe;
    handlePipe();
    return;
  }

  Terminal.outputHistory.push(...Terminal.outputToBeProcessed);
  advancePipe();
}

function handlePipeToFile(parsedCommand: (string | number | boolean)[], commandString: string): void {
  if (parsedCommand.length > 1) {
    handlePipeError(
      `Invalid pipe to file command: ${commandString} . Only a single file can be specified; no flags are supported.`,
    );
    Terminal.outputToBeProcessed.length = 0;
    return;
  }
  const command = parsedCommand[0].toString();

  if (hasTextExtension(command)) {
    writeToTextFile(command);
  } else if (hasScriptExtension(command)) {
    writeToScriptFile(command);
  } else {
    handlePipeError(`Invalid file extension for pipe to file command: ${command}`);
    Terminal.outputToBeProcessed.length = 0;
    return;
  }

  // If there are further pipes, pass the same output to them
  if (Terminal.currentTerminalPipe?.nextPipe) {
    Terminal.currentTerminalPipe = Terminal.currentTerminalPipe.nextPipe;
    handlePipe();
  } else {
    advancePipe();
  }
}

function writeToTextFile(filename: string) {
  const file = Terminal.getTextFile(filename);
  const output = Terminal.outputToBeProcessed.map((o) => stringify(o, true)).join("\n");
  const overwrite = Terminal.currentTerminalPipe?.pipeType === ">";
  if (file && !overwrite) {
    file.text += `${file.text ? "\n" : ""}${output}`;
  } else if (file && overwrite) {
    file.text = output;
  } else {
    const newFile = new TextFile(filename as TextFilePath, output);
    Player.getCurrentServer().textFiles.set(filename as TextFilePath, newFile);
  }
}

function writeToScriptFile( filename: string): void {
  const file = Terminal.getScript(filename);
  const output = Terminal.outputToBeProcessed.map((o) => stringify(o, true)).join("\n");
  const overwrite = Terminal.currentTerminalPipe?.pipeType === ">";

  if (file && overwrite) {
    file.content = output
  } else if (file) {
    file.content += `${file.content ? "\n" : ""}${output}`;
  } else {
    const newFile = new Script(filename as ScriptFilePath, output);
    Player.getCurrentServer().scripts.set(filename as ScriptFilePath, newFile);
  }
}

function handlePipeToScript(parsedCommand: (string | number | boolean)[]): void {
  const command = parsedCommand[0].toString();
  const firstScriptArg = parsedCommand.find((arg) => hasScriptExtension(arg.toString()));
  const fileName = command.toLowerCase() === "run" && firstScriptArg ? firstScriptArg.toString() : command;
  const scriptArgs = [...parsedCommand.slice(1), ...Terminal.outputToBeProcessed.map((o) => stringify(o, true))];

  const file = Terminal.getScript(fileName ?? "");
  if (!file) {
    handlePipeError(`Script file ${fileName} not found.`);
    return;
  }

  const script = runScript(file.filename, scriptArgs, Player.getCurrentServer());
  if (!script) {
    handlePipeError(`Failed to run script ${file.filename}.`);
    return;
  }
  script.pipeConfig = Terminal.currentTerminalPipe?.nextPipe ?? null;
  Terminal.currentTerminalPipe = null;
  advancePipe();
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

export type PipedCommand = {
  commandString: string;
  pipeType: string;
  nextPipe: PipedCommand | null;
};

export type ScriptPipe = {
  pipe: PipedCommand;
  output: (Output | Link | RawOutput)[];
};
