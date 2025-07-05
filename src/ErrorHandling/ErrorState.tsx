import { EventEmitter } from "../utils/EventEmitter";

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
  PreventModalsUntil: new Date(),
};

export function errorModalsAreSuppressed(): boolean {
  return ErrorState.PreventModalsUntil.getTime() > Date.now();
}

export function toggleSuppressErrorModals(newValue: boolean, indefinite = false): void {
  if (newValue) {
    ErrorState.PreventModalsUntil = new Date(indefinite ? new Date("3000-01-01") : Date.now() + 1000 * 60 * 5);
    ErrorState.ActiveError = null;
  } else {
    ErrorState.PreventModalsUntil = new Date();
  }
}
