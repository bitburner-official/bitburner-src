import { TerminalEvents } from "./TerminalEvents";
import { Terminal } from "../Terminal";
import { parseCommand } from "./Parser";
import { hasTextExtension, TextFilePath } from "../Paths/TextFilePath";
import { TextFile } from "../TextFile";
import { Player } from "@player";
import { hasScriptExtension } from "../Paths/ScriptFilePath";
import { runScript } from "./commands/runScript";
import { Link, Output, RawOutput } from "./OutputTypes";
import { PipedCommand } from "./Terminal";

TerminalEvents.subscribe(handlePipe);

function handlePipe() {

  // TODO: handle pipes from scripts



  if (Terminal.outputToBeProcessed.length === 0 || Terminal.action || !Terminal.currentTerminalPipe) {
    return;
  }

  const commandString = Terminal.currentTerminalPipe.commandString;

  const parsedCommand = parseCommand(commandString);
  const command = parsedCommand[0].toString();

  // ECHO or empty command: Pipe to stout
  if (!commandString || parsedCommand.length === 0 || command.toLowerCase() === 'echo') {
    return handleEcho();
  }

  // Pipe to file
  if (hasTextExtension(command)) {
    handlePipeToFile(parsedCommand, commandString);
    return TerminalEvents.emit();
  }

  // TODO: test piping to script
  if (hasScriptExtension(command)) {
    handlePipeToScript(parsedCommand);
    return TerminalEvents.emit();
  }


  // TODO: handle grep

  // TODO: handle downstream pipe(s)
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

export function parsePipes(commandString: string, fullCommandString = ""): PipedCommand | null {
  const firstCommand =  commandString.split(/[|>]/)[0]
  if (!firstCommand || firstCommand.trim() === (fullCommandString || commandString).trim()) {
    return null;
  }

  return {
    commandString: firstCommand.trim(),
    nextPipe: parsePipes(commandString.slice(firstCommand.length + 1).trim(), fullCommandString || commandString),
  }

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
    handlePipeError(`Invalid pipe to file command: ${commandString} . Only a single file can be specified; no flags are supported.`);
    Terminal.outputToBeProcessed.length = 0;
    return;
  }

  const file = Terminal.getTextFile(command);
  const output = Terminal.outputToBeProcessed.map(stringify).join("\n");
  if (file) {
    file.text += `${file.text ? "\n" : ""}${output}`;
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
  const firstScriptArg = parsedCommand.find((arg) => hasScriptExtension(arg.toString()))
  const fileName = command.toLowerCase() === "run" && firstScriptArg ? firstScriptArg.toString() : command;
  const scriptArgs = [...parsedCommand.slice(1), ...Terminal.outputToBeProcessed.map(stringify)];

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



function stringify(s: Output | Link | RawOutput): string {
  if (s instanceof Output) {
    return s.text;
  } else if (s instanceof Link) {
    return `${s.dashes} ${s.hostname}`;
  } else {
    return s.raw?.toString() ?? "";
  }
}
