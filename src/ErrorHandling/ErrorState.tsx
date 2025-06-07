import { EventEmitter } from "../utils/EventEmitter";
import { Settings } from "../Settings/Settings";
import { GetAllServers } from "../Server/AllServers";
import { killWorkerScriptByPid } from "../Netscript/killWorkerScript";
import { Router } from "../ui/GameRoot";
import { SimplePage } from "@enums";

export type ErrorState = {
  ErrorUpdate: EventEmitter<[ErrorRecord]>;
  ActiveError: ErrorRecord | null;
  Errors: ErrorRecord[];
  UnreadErrors: number;
  PreventModalsUntil: Date | null;
};

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

export const ErrorState: ErrorState = {
  ErrorUpdate: new EventEmitter<[ErrorRecord]>(),
  ActiveError: null as ErrorRecord | null,
  Errors: [],
  UnreadErrors: 0,
  PreventModalsUntil: null,
};

export function errorModalsAreSuppressed(): boolean {
  return (
    Settings.SuppressErrorModals || (!!ErrorState.PreventModalsUntil && ErrorState.PreventModalsUntil > new Date())
  );
}

export const DisplayError = (
  message: string,
  errorType: string,
  scriptName = "",
  hostname: string = "",
  pid: number = -1,
) => {
  const errorPageOpen = Router.page() === SimplePage.ActiveScripts;
  if (!errorPageOpen) {
    ErrorState.UnreadErrors++;
  }
  const prior = findExistingErrorCopy(message, hostname);
  if (prior) {
    prior.occurrences++;
    prior.time = new Date();
    pid != -1 && (prior.pid = pid);
    prior.unread = !errorPageOpen;
    prior.server = hostname;
    prior.message = message;

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
      unread: !errorPageOpen,
    });
    ErrorState.Errors = ErrorState.Errors.slice(0, Settings.MaxRecentScriptsCapacity);

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
  if (!ErrorState.ActiveError) {
    ErrorState.ActiveError = error;
    ErrorState.ErrorUpdate.emit(ErrorState.ActiveError);
  }
}

export const killAllScripts = () => {
  GetAllServers().forEach((server) => {
    for (const byPid of server.runningScriptMap.values()) {
      for (const pid of byPid.keys()) {
        killWorkerScriptByPid(pid);
      }
    }
  });
};
