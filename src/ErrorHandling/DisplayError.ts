import { Router } from "../ui/GameRoot";
import { SimplePage } from "@enums";
import { errorModalsAreSuppressed, ErrorRecord, ErrorState } from "./ErrorState";

let currentId = 0;

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
    while (ErrorState.Errors.length > 100) {
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
  if (!ErrorState.ActiveError && !errorModalsAreSuppressed()) {
    ErrorState.ActiveError = error;
    ErrorState.ErrorUpdate.emit(ErrorState.ActiveError);
  }
}
