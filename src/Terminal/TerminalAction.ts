import { StdIO } from "./StdIO/StdIO";
import type { RunningScript } from "../Script/RunningScript";

/**
 * What a terminal command returns, which decides when its output is closed:
 * - undefined: the command has finished, so its output is closed right away
 * - TerminalAction: a foreground action; its output is closed once `finished` settles
 * - Promise: the command keeps writing in the background (e.g. while reading stdin); its output is closed once it settles
 * - RunningScript: a script now owns the output, and closes it when the script exits
 */
export type CommandResult = undefined | TerminalAction | Promise<void> | RunningScript;

/** One stage of a pipeline: `done` settles once its output is closed, unless a running script owns that output */
export interface StageResult {
  done: Promise<void>;
  ownedByScript: boolean;
}

export interface TerminalAction {
  // Abort the current action on a best-effort basis, if it is not already
  // completed. Does nothing if "finished" is already resolved.
  cancel: () => void;

  // Signal for when the action is complete. Will be rejected with Cancellation
  // if cancel is called before resolving.
  finished: Promise<void>;

  // Returns the current displayed progress for this action.
  getProgressText: () => string;

  // The terminal pipe output of the current action
  stdIO: StdIO;
}

export class Cancellation extends Error {
  constructor(name: string) {
    super(`Terminal command ${name} was cancelled`);
  }
}
