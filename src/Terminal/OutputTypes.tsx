import React from "react";
import { Settings } from "../Settings/Settings";
import { formatTime } from "../utils/helpers/formatTime";

export class Output {
  text: string;
  color: "primary" | "error" | "success" | "info" | "warn";
  constructor(text: string, color: "primary" | "error" | "success" | "info" | "warn") {
    this.text = text;
    this.color = color;
  }
}

export class RawOutput {
  raw: React.ReactNode;
  constructor(node: React.ReactNode) {
    this.raw = node;
  }
}

export class Link {
  dashes: string;
  path: string[];
  text: string;
  constructor(dashes: string, path: string[], text: string) {
    this.dashes = dashes;
    this.path = path;
    this.text = text;
  }
}

/**
 * Adds the player's timestamp to output that is about to be shown on the terminal.
 * Timestamps are only added here, so output passed through pipes and redirects stays unstamped.
 */
export function withTimestamp(item: Output | Link | RawOutput): Output | Link | RawOutput {
  if (!Settings.TimestampsFormat) return item;
  const timestamp = `[${formatTime(Settings.TimestampsFormat)}] `;
  if (item instanceof Output) return new Output(timestamp + item.text, item.color);
  if (item instanceof Link) return new Link(timestamp + item.dashes, item.path, item.text);
  return new RawOutput(
    (
      <>
        {timestamp}
        {item.raw}
      </>
    ),
  );
}
