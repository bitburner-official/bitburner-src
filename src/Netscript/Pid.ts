import { workerScripts } from "./WorkerScripts";
import { recentScripts } from "../Netscript/RecentScripts";

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

export function resetPidCounter(): void {
  /* The function `AddRecentScript` de-duplicates scripts by PID.
   * Therefore the list has to be cleared when resetting the PID counter.
   * Otherwise scripts which re-use a PID from the list of recent scripts
   * do not show up there when they finish (if the previous script with
   * that PID is still in the list at that point). */
  recentScripts.splice(0);
  pidCounter = 1;
}
