import React, { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Link, Output, RawOutput } from "../OutputTypes";
import { ANSI_ESCAPE } from "../../ui/React/ANSIITypography";
import { PortHandle, PortNumber } from "../../NetscriptPort";
import { commandArgRegex } from "../Parser";
import { TTheme } from "../../Themes/ui/Theme";

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
    return `${s.dashes} ${s.text}`;
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
  // Rendered outside the app's React tree, so provide the game theme that components like <Money> read
  const markup = renderToStaticMarkup(
    <TTheme>
      <>{element}</>
    </TTheme>,
  )
    // separate sibling elements (e.g. ls file names and columns) with one space
    .replaceAll(/(<\/[^>]+>)(?=<(?!\/|br\b))/g, "$1 ")
    .replaceAll("<br/>", "\n");
  const div = document.createElement("div");
  div.innerHTML = markup;
  return (div.innerText ?? div.textContent ?? "").trimEnd();
}

export function getCommandAfterLastPipe(commandString: string): string {
  // Only the command after the last unquoted ; can be in a pipe
  // See https://regex101.com/r/uAbnpN/1 for a breakdown of this regex
  const lastCommand = commandString.replace(/^(?:'[^']*'|"[^"]*"|[^;"'])*;/, "");
  const lastPipe = [...lastCommand.matchAll(commandArgRegex)].findLast((match) => isPipeSymbol(match[0]));
  return lastPipe ? lastCommand.slice(lastPipe.index + lastPipe[0].length) : commandString;
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
