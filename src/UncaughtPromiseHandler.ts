import { handleUnknownError } from "./utils/ErrorHandler";

export function setupUncaughtPromiseHandler(): void {
  window.addEventListener("unhandledrejection", (e) => {
    e.preventDefault();
    handleUnknownError(
      e.reason,
      null,
      "UNCAUGHT PROMISE ERROR\nYou forgot to handle a promise's error (e.g., ns.hack, ns.grow, ns.weaken).\n\n",
    );
  });
}
