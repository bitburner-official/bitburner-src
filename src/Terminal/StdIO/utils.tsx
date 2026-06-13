import React, { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Link, Output, RawOutput } from "../OutputTypes";
import { ANSI_ESCAPE } from "../../ui/React/ANSIITypography";
import { PortHandle, PortNumber } from "../../NetscriptPort";
import { parseCommand } from "../Parser";

export type Args = string | number | boolean;

export const PipeSymbols = {
  Pipe: "|",
  OutputRedirection: ">",
  AppendOutputRedirection: ">>",
  InputRedirection: "<",
} as const;

export function isPipeSymbol(symbol: string | number | boolean): boolean {
  return Object.keys(PipeSymbols).some((key) => PipeSymbols[key as keyof typeof PipeSymbols] === symbol);
}

export function stringify(s: unknown, stripAnsiEscape = false): string {
  if (s == null) {
    return "";
  } else if (s instanceof Output) {
    return clean(s.text, stripAnsiEscape);
  } else if (s instanceof Link) {
    return `${s.dashes} ${s.hostname}`;
  } else if (s instanceof RawOutput) {
    return stringifyReactElement(s.raw);
  } else if (isValidElement(s)) {
    return stringifyReactElement(s);
  } else if (s instanceof HTMLElement) {
    return s.innerText;
  } else if (typeof s === "string" || typeof s === "number" || typeof s === "boolean") {
    return clean(s.toString(), stripAnsiEscape);
  } else {
    return clean(JSON.stringify(s), stripAnsiEscape);
  }
}

export function stringifyReactElement(element: React.ReactNode): string {
  const markup = renderToStaticMarkup(<>{element}</>);
  const div = document.createElement("div");
  div.innerHTML = markup.replaceAll(">", "> ").replaceAll("<br/>", "\n");
  return (div.innerText ?? div.textContent ?? "").trim();
}

export function getCommandAfterLastPipe(commandString: string): string {
  const parsedCommands = parseCommand(commandString);
  const lastPipeIndex = parsedCommands.findLastIndex(isPipeSymbol);
  if (lastPipeIndex === -1) {
    return commandString;
  }

  return parsedCommands.slice(lastPipeIndex + 1).join(" ");
}

function clean(str: string, stripAnsiEscape: boolean) {
  return stripAnsiEscape ? str.replaceAll(ANSI_ESCAPE, "") : str;
}

let nextStdinPort = -1;
export function getNextStdinHandle(): PortHandle {
  // port numbers for pipes are negative numbers to avoid collisions with standard player ns ports
  return new PortHandle(nextStdinPort-- as PortNumber);
}
export function resetStdinHandleCounter() {
  nextStdinPort = -1;
}
