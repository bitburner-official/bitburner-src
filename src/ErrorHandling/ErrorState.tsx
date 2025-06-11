import { EventEmitter } from "../utils/EventEmitter";
import { Settings } from "../Settings/Settings";
import { Router } from "../ui/GameRoot";
import { SimplePage } from "@enums";

let currentId = 0;

export type ErrorRecord = {
  id: number;
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
  UnreadErrors: 0,
  PreventModalsUntil: Settings.SuppressErrorModals ? new Date("3000-01-01") : new Date(),
};

export function errorModalsAreSuppressed(): boolean {
  return Settings.SuppressErrorModals || ErrorState.PreventModalsUntil > new Date();
}

export function toggleSuppressErrorModals(newValue: boolean): void {
  if (newValue) {
    ErrorState.PreventModalsUntil = new Date(Date.now() + 1000 * 60 * 5); // Suppress for 5 minutes
  } else {
    ErrorState.PreventModalsUntil = new Date();
  }
}

export function toggleSuppressErrorModalsSetting(newValue: boolean): void {
  Settings.SuppressErrorModals = newValue;
  if (newValue) {
    ErrorState.PreventModalsUntil = new Date("3000-01-01");
  } else {
    ErrorState.PreventModalsUntil = new Date();
  }
}

export const DisplayError = (
  message: string,
  errorType: string,
  scriptName = "",
  hostname: string = "",
  pid: number = -1,
) => {
  const errorPageOpen = Router.page() === SimplePage.RecentErrors;
  if (!errorPageOpen) {
    ErrorState.UnreadErrors++;
  }
  const prior = findExistingErrorCopy(message, hostname);
  if (prior) {
    prior.occurrences++;
    prior.time = new Date();
    if (pid !== -1) {
      prior.pid = pid;
    }
    prior.server = hostname;
    prior.message = message;

    updateActiveError(prior);
  } else {
    ErrorState.Errors.unshift({
      id: currentId++,
      server: hostname,
      errorType,
      scriptName,
      message,
      pid,
      occurrences: 1,
      time: new Date(),
      unread: !errorPageOpen,
    });
    while (ErrorState.Errors.length > Settings.MaxRecentScriptsCapacity) {
      ErrorState.Errors.pop();
    }
    updateActiveError(ErrorState.Errors[0]);
  }
};

function findExistingErrorCopy(message: string, hostname: string): ErrorRecord | null {
  const serverAgnosticMessage = message.replaceAll(hostname, "<server>");
  return (
    ErrorState.Errors.find(
      (e) => e.message.replaceAll(e.server, "<server>") === serverAgnosticMessage || e.message === message,
    ) ?? null
  );
}

function updateActiveError(error: ErrorRecord): void {
  // TODO: Fix this bug
  if (!ErrorState.ActiveError) {
    ErrorState.ActiveError = error;
    ErrorState.ErrorUpdate.emit(ErrorState.ActiveError);
  }
}
