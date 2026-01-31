import React, { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Link, Output, RawOutput } from "../OutputTypes";
import { ANSI_ESCAPE } from "../../ui/React/ANSIITypography";

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
    // TODO: test
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

function clean(str: string, stripAnsiEscape: boolean) {
  return stripAnsiEscape ? str.replaceAll(ANSI_ESCAPE, "") : str;
}
