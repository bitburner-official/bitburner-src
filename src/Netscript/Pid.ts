import { workerScripts } from "./WorkerScripts";

let pidCounter = 1;

/** Find and return the next available PID for a script */
export function generateNextPid(): number {
  let pidCandidate = pidCounter;

  // Cap the number of search iterations at some arbitrary value to avoid
  // infinite loops. We'll assume that players won't have a million running scripts.
  for (let attemptCounter = 0; attemptCounter < 1e6; ++attemptCounter, ++pidCandidate) {
    // ensure the candidate PID is a safe integer
    if (pidCandidate >= Number.MAX_SAFE_INTEGER) {
      pidCandidate = 1;
    }
    // ensure the PID is not in use
    if (workerScripts.has(pidCandidate)) {
      continue;
    }
    // found a PID that's not in use
    pidCounter = pidCandidate + 1;
    return pidCandidate;
  }
  // ran out of attempts without finding an unused PID :-(
  return -1;
}

/**
 * Reset the PID counter to 1.
 *
 * Note that the list of recently finished scripts has to be
 * cleared (`recentScripts.splice(0)`) when resetting the PID counter.
 * Otherwise scripts which re-use a PID that is still in the
 * list of recent scripts do not show up there when they finish
 * (if the previous script with that PID is still in the list at that point),
 * because the function `AddRecentScript` de-duplicates scripts by PID.
 */
export function resetPidCounter(): void {
  pidCounter = 1;
}
