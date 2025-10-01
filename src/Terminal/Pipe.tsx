import React from "react";
import { TerminalEvents } from "./TerminalEvents";
import { renderToStaticMarkup } from "react-dom/server";
import { Terminal } from "../Terminal";
import { parseCommand } from "./Parser";
import { hasTextExtension, TextFilePath } from "../Paths/TextFilePath";
import { TextFile } from "../TextFile";
import { Player } from "@player";
import { hasScriptExtension } from "../Paths/ScriptFilePath";
import { runScript } from "./commands/runScript";
import { Link, Output, RawOutput } from "./OutputTypes";
import { PipedCommand } from "./Terminal";
import { ANSI_ESCAPE } from "../ui/React/ANSIITypography";
import { debounce } from "lodash";

const debouncedHandlePipe = debounce(() => handlePipe(), 50);

TerminalEvents.subscribe(debouncedHandlePipe);

function handlePipe(): void {
  // TODO: handle pipes from scripts

  if (Terminal.outputToBeProcessed.length === 0 || Terminal.action || !Terminal.currentTerminalPipe) {
    return;
  }

  const commandString = Terminal.currentTerminalPipe.commandString;

  const parsedCommand = parseCommand(commandString);
  const command = parsedCommand[0]?.toString();

  // ECHO or empty command: Pipe to stout
  if (!commandString || parsedCommand.length === 0 || command.toLowerCase() === "echo") {
    return handleEcho();
  }

  // Pipe to file
  if (hasTextExtension(command)) {
    handlePipeToFile(parsedCommand, commandString);
    return TerminalEvents.emit();
  }

  // TODO: pipe to script file?

  // TODO: test piping to script
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

export function parsePipes(commandString: string) {
  const pipeRegex = /(>>)|[|>]/g;
  const match = pipeRegex.exec(commandString);
  if (!match) {
    return null;
  }
  const command = commandString.split(pipeRegex)[0].trim();

  return {
    firstCommand: command,
    pipeChain: buildPipeChain(commandString.slice(match.index - 1)),
  };
}

function buildPipeChain(commandString: string): PipedCommand | null {
  const pipeRegex = /(>>)|[|>]/g;
  const match = pipeRegex.exec(commandString);
  if (!match) return null;

  const commandStringWithoutLeadingPipe = commandString.slice(match.index + match[0].length).trim();
  const nextCommand = commandStringWithoutLeadingPipe.split(pipeRegex)[0].trim();
  const remainingCommandString = commandStringWithoutLeadingPipe.slice(nextCommand.length).trim();

  return {
    commandString: nextCommand,
    pipeType: match[0],
    nextPipe: buildPipeChain(remainingCommandString),
  };
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
  const command = parsedCommand[0].toString();
  if (parsedCommand.length > 1) {
    handlePipeError(
      `Invalid pipe to file command: ${commandString} . Only a single file can be specified; no flags are supported.`,
    );
    Terminal.outputToBeProcessed.length = 0;
    return;
  }

  const file = Terminal.getTextFile(command);
  const output = Terminal.outputToBeProcessed.map((o) => stringify(o, true)).join("\n");
  const overwrite = Terminal.currentTerminalPipe?.pipeType === ">";
  if (file && !overwrite) {
    file.text += `${file.text ? "\n" : ""}${output}`;
  } else if (file && overwrite) {
    file.text = output;
  } else {
    const newFile = new TextFile(command as TextFilePath, output);
    Player.getCurrentServer().textFiles.set(command as TextFilePath, newFile);
  }

  // If there are further pipes, pass the same output to them
  if (Terminal.currentTerminalPipe?.nextPipe) {
    Terminal.currentTerminalPipe = Terminal.currentTerminalPipe.nextPipe;
    handlePipe();
  } else {
    advancePipe();
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

function stringify(s: Output | Link | RawOutput, stripAnsiEscape = false): string {
  if (s instanceof Output) {
    return stripAnsiEscape ? s.text.replaceAll(ANSI_ESCAPE, "") : s.text;
  } else if (s instanceof Link) {
    return `${s.dashes} ${s.hostname}`;
  } else {
    const markup = renderToStaticMarkup(<>{s.raw}</>);
    const div = document.createElement("div");
    div.innerHTML = markup.replaceAll(">", "> ");
    return div.textContent ?? div.innerText ?? "";
  }
}
