import { workerScripts } from "./WorkerScripts";

let pidCounter = 1;

/** Find and return the next available PID for a script */
export function generateNextPid(): number {
  let pidCandidate = pidCounter;

  // Cap the number of search iterations at some arbitrary value to avoid
  // infinite loops. We'll assume that players won't have a million running scripts.
  for (let attemptCounter = 0; attemptCounter < 1e6; ++attemptCounter) {
    if (!workerScripts.has(pidCandidate)) {
      // found a PID that's not in use
      // set the counter to the successor of the found PID, wrapping back to 1 when it gets too high
      pidCounter = pidCandidate + 1;
      if (pidCounter >= Number.MAX_SAFE_INTEGER) {
        pidCounter = 1;
      }
      return pidCandidate;
    }

    ++pidCandidate;
    if (pidCandidate >= Number.MAX_SAFE_INTEGER) {
      pidCandidate = 1;
    }
  }
  // ran out of attempts without finding a valid unused pid :-(
  return -1;
}

export function resetPidCounter(): void {
  pidCounter = 1;
}
