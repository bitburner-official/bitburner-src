import { EventEmitter } from "../utils/EventEmitter";
import { Settings } from "../Settings/Settings";

export type ErrorRecord = {
  server: string;
  errorType: string;
  message: string;
  scriptName: string;
  pid: number;
  occurrences: number;
  time: Date;
  unread: boolean;
  force?: boolean;
};

export const ErrorState = {
  ErrorUpdate: new EventEmitter<[ErrorRecord]>(),
  ActiveError: null as ErrorRecord | null,
  Errors: [] as ErrorRecord[],
  ErrorPageOpen: false,
  UnreadErrors: 0,
  PreventModals: Settings.SuppressErrorModals,
};

export const DisplayError = (
  message: string,
  errorType: string,
  scriptName = "",
  hostname: string = "",
  pid: number = -1,
) => {
  const prior = ErrorState.Errors.find((e) => e.message === message);
  if (!ErrorState.ErrorPageOpen) {
    ErrorState.UnreadErrors++;
  }
  if (prior) {
    prior.occurrences++;
    prior.time = new Date();
    if (pid !== -1) {
      prior.pid = pid;
    }
    prior.unread = !ErrorState.ErrorPageOpen;

    updateActiveError(prior);
  } else {
    ErrorState.Errors.unshift({
      server: hostname,
      errorType,
      scriptName,
      message,
      pid,
      occurrences: 1,
      time: new Date(),
      unread: !ErrorState.ErrorPageOpen,
    });
    while (ErrorState.Errors.length > Settings.MaxRecentScriptsCapacity) {
      ErrorState.Errors.pop();
    }
    updateActiveError(ErrorState.Errors[0]);
  }
};

function updateActiveError(error: ErrorRecord): void {
  // TODO: Fix this bug
  if (!ErrorState.ActiveError) {
    ErrorState.ActiveError = error;
    ErrorState.ErrorUpdate.emit(ErrorState.ActiveError);
  }
}
