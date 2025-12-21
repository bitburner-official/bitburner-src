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
  } else if (typeof s === "string" || typeof s === "number" || typeof s === "boolean") {
    return s.toString().replaceAll(ANSI_ESCAPE, "");
  } else {
    return JSON.stringify(s).replaceAll(ANSI_ESCAPE, "");
  }
}
