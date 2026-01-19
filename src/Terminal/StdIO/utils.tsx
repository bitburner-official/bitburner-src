import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Link, Output, RawOutput } from "../OutputTypes";
import { ANSI_ESCAPE } from "../../ui/React/ANSIITypography";

export const DATA_STREAM_CLOSED = "IO_STREAM_CLOSED";

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
  if (s === undefined || s === null) {
    return "";
  } else if (s instanceof Output) {
    return clean(s.text, stripAnsiEscape);
  } else if (s instanceof Link) {
    return `${s.dashes} ${s.hostname}`;
  } else if (s instanceof RawOutput) {
    // TODO: test
    return stringifyReactElement(s.raw);
  } else if (s instanceof HTMLElement) {
    return s.innerText;
  } else if (s === "string" || typeof s === "number" || typeof s === "boolean") {
    return clean(s.toString(), stripAnsiEscape);
  } else {
    return clean(JSON.stringify(s), stripAnsiEscape);
  }
}

function stringifyReactElement(element: React.ReactNode): string {
  const markup = renderToStaticMarkup(<>{element}</>);
  const div = document.createElement("div");
  div.innerHTML = markup.replaceAll(">", "> ");
  return div.textContent ?? div.innerText ?? "";
}

function clean(str: string, stripAnsiEscape: boolean) {
  return stripAnsiEscape ? str.replaceAll(ANSI_ESCAPE, "") : str;
}
