import { workerScripts } from "./WorkerScripts";
import { recentScripts } from "./Netscript/RecentScripts";

let pidCounter = 1;

/** Find and return the next available PID for a script */
export function generateNextPid(): number {
  let pidCandidate = pidCounter;

  // Cap the number of search iterations at some arbitrary value to avoid
  // infinite loops. We'll assume that players won't have a million running scripts.
  for (let attemptCounter = 0; attemptCounter < 1e6; ++attemptCounter) {
    /* Also check the recentScripts: The function `AddRecentScript` de-duplicates scripts by PID.
       * Therefore scripts which re-use a PID from that list do not show up the list of recent scripts
       * upon termination (if the previous script with that PID is still in the list at that point).
       * Such a PID re-use could happen after installing augmentations, which resets the PID counter
       * but does not clear the list recent scripts. */
    if (!workerScripts.has(pidCandidate)
         && recentScripts.some((r) => (r.runningScript.pid === pidCandidate))) {
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
