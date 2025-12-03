import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseCommand } from "../Parser";
import { isPipeSymbol } from "../PipeState";
import { DataStream } from "./DataStream";
import { StdIO } from "./StdIO";
import { Link, Output, RawOutput } from "../OutputTypes";
import { ANSI_ESCAPE } from "../../ui/React/ANSIITypography";
import { Terminal } from "../../Terminal";

export function buildRedirectedCommandChain(commandString: string) {
  let parsedCommands = parseCommand(commandString);

  if (!parsedCommands.find(isPipeSymbol)) {
    return null;
  }

  const redirectCommandChain: string[][] = [];
  const redirectIOChain: StdIO[] = [];

  let firstCommand;
  while ((firstCommand = getFirstCommand(parsedCommands))) {
    parsedCommands = parsedCommands.slice(firstCommand.length);
    redirectCommandChain.push(firstCommand);
  }

  // todo: validateInputRedirectionAndConvertToCat

  for (let i = 0; i < redirectCommandChain.length - 1; i++) {
    const cmd = redirectCommandChain[i];
    const priorIO = redirectIOChain[i - 1];

    const callback = getCallbackForRedirectedCommand(cmd);

    // TODO: call the command with priorIO.stdin as its stdin

    const stdIO = new StdIO(priorIO?.stdout ?? null, callback);
    redirectIOChain.push(stdIO);
  }

  getTerminalStdIO(redirectIOChain[redirectIOChain.length - 1].stdout);
}

function getCallbackForRedirectedCommand(command: string[]): (data: unknown, stdout: DataStream) => Promise<void> | void {
  // TODO - identify command and pipe type
  return (data: unknown, stdout: DataStream) => {
    stdout.write(data);
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

export function getTerminalStdIO(stdin: DataStream) {
  const stdIO = new StdIO(stdin, terminalOutput);
  stdIO.stdout.close();
  return stdIO;
}

function terminalOutput(data: unknown, __: DataStream): void {
  if (data instanceof Output || data instanceof Link || data instanceof RawOutput) {
    Terminal.terminalOutput(data);
  } else {
    Terminal.printAndBypassPipes(stringify(data));
  }
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
  } else {
    return JSON.stringify(s);
  }
}
