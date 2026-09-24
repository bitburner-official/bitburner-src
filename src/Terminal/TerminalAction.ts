import { StdIO } from "./StdIO/StdIO";

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
