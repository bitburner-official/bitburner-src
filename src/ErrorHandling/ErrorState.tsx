import { EventEmitter } from "../utils/EventEmitter";
import { Settings } from "../Settings/Settings";
import { GetAllServers } from "../Server/AllServers";
import { killWorkerScriptByPid } from "../Netscript/killWorkerScript";

export type ErrorState = {
  ErrorUpdate: EventEmitter<[ErrorRecord]>;
  ActiveError: ErrorRecord | null;
  Errors: ErrorRecord[];
  ErrorPageOpen: boolean;
  UnreadErrors: number;
  PreventModals: boolean;
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
    pid != -1 && (prior.pid = pid);
    prior.unread = !ErrorState.ErrorPageOpen;

    updateActiveError(prior);
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

    updateActiveError(ErrorState.Errors[ErrorState.Errors.length - 1]);
  }
};

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
