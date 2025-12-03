import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseCommand } from "../Parser";
import { isPipeSymbol } from "../PipeState";
import { IOStream } from "./IOStream";
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
    //redirectCommandChain.push(firstCommand); // TODO
  }

  // todo: validateInputRedirectionAndConvertToCat

  for (let i = 0; i < redirectCommandChain.length - 1; i++) {
    const cmd = redirectCommandChain[i];
    const priorIO = redirectIOChain[i - 1];

    // TODO: call the command with priorIO.stdin as its stdin

    const stdIO = new StdIO(priorIO?.stdout ?? null);
    // TODO: change this to handle commands individually. Not all need a call on read.
    void callOnRead(stdIO, getCallbackForRedirectedCommand(cmd, stdIO.stdout));
    redirectIOChain.push(stdIO);
  }

  getTerminalStdIO(redirectIOChain[redirectIOChain.length - 1].stdout);
}

function getCallbackForRedirectedCommand(
  commandStrings: string[],
  stdout: IOStream,
): (data: unknown, stdout: IOStream) => Promise<void> | void {
  const pipeSymbol = isPipeSymbol(commandStrings[0]) ? commandStrings[0] : null;
  const command = commandStrings.find((cmd) => !isPipeSymbol(cmd));

  if (!command) {
    Terminal.error(`Invalid command: no command found after output redirect.`);
  }

  if (command === "echo") {
    // Echo ignores its stdin and just outputs its arguments
    handleEcho(commandStrings, stdout);
    return () => {};
  }

  return (data: unknown, stdout: IOStream) => {
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

function handleEcho(commandStrings: string[], stdout: IOStream): void {
  // TODO: close stdin
  const args = commandStrings.slice(1);
  for (const arg of args) {
    stdout.write(arg);
  }
  stdout.close();
}

export function getTerminalStdIO(stdin: IOStream) {
  const stdIO = new StdIO(stdin);
  stdIO.stdout.close();

  void startTerminalOutputStream(stdIO);

  return stdIO;
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
    await callback(data, stdio.stdout);
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
