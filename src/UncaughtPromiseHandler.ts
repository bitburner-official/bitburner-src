import { handleUnknownError } from "./utils/ErrorHandler";

export function setupUncaughtPromiseHandler(): void {
  window.addEventListener("unhandledrejection", (e) => {
    e.preventDefault();
    handleUnknownError(e.reason, null, "UNCAUGHT PROMISE ERROR. Caused by:\n\n");
  });
}
