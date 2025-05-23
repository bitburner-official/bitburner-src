import { EventEmitter } from "../utils/EventEmitter";
import { Settings } from "../Settings/Settings";

export type ErrorState = {
  ErrorUpdate: EventEmitter<[ErrorRecord]>;
  ActiveError: ErrorRecord | null;
  Errors: ErrorRecord[];
  ErrorPageOpen: boolean;
  UnreadErrors: number;
  PreventModals: boolean;
}

export type ErrorRecord = {
  server: string,
  errorType: string,
  message: string;
  scriptName: string;
  pid: number;
  occurrences: number;
  time: Date;
  unread: boolean;
}

export const ErrorState: ErrorState = {
  ErrorUpdate:  new EventEmitter<[ErrorRecord]>(),
  ActiveError: null as ErrorRecord | null,
  Errors: [],
  ErrorPageOpen: false,
  UnreadErrors: 0,
  PreventModals: Settings.SuppressErrorModals,
}


export const DisplayError = (message: string, errorType: string, scriptName = "", hostname: string = "", pid: number = -1) => {
  const prior = ErrorState.Errors.find((e) => e.message === message);
  if (!ErrorState.ErrorPageOpen) {
    ErrorState.UnreadErrors++;
  }
  if (prior) {
    prior.occurrences++;
    prior.time = new Date();
    pid != -1 && (prior.pid = pid);
    prior.unread = !ErrorState.ErrorPageOpen;

    ErrorState.ActiveError = prior; // TODO
  } else {
    ErrorState.Errors.push({
      server: hostname,
      errorType,
      scriptName,
      message,
      pid,
      occurrences: 1,
      time: new Date(),
      unread: !ErrorState.ErrorPageOpen,
    });
    ErrorState.Errors = ErrorState.Errors.slice(0, Settings.MaxRecentScriptsCapacity);

    ErrorState.ActiveError = ErrorState.Errors[0]; // TODO
  }
  ErrorState.ErrorUpdate.emit(ErrorState.ActiveError);
}