/**
 * Stops an actively-running script (represented by a WorkerScript object)
 * and removes it from the global pool of active scripts.
 */
import { ScriptDeath } from "./ScriptDeath";
import { WorkerScript } from "./WorkerScript";
import { workerScripts } from "./WorkerScripts";

import { GetAllServers, GetServer } from "../Server/AllServers";
import { AddRecentScript } from "./RecentScripts";
import { handleUnknownError } from "../utils/ErrorHandler";
import { roundToTwo } from "../utils/helpers/roundToTwo";
import { BaseServer } from "../Server/BaseServer";
import { scriptKey } from "../utils/helpers/scriptKey";

export function killWorkerScript(ws: WorkerScript): void {
  stopAndCleanUpWorkerScript(ws);
}

export function killWorkerScriptByPid(pid: number, killer?: WorkerScript): boolean {
  const ws = workerScripts.get(pid);
  if (ws instanceof WorkerScript) {
    ws.log("", () => (killer ? `Script killed by script ${killer.name} with PID ${killer.pid}` : "Script killed."));
    stopAndCleanUpWorkerScript(ws);
    return true;
  }

  return false;
}

export const killAllScripts = () => {
  for (const server of GetAllServers(true)) {
    killServerScripts(server, "Script killed.");
  }
};

export const killServerScripts = (server: BaseServer, message: string) => {
  const scripts = server.runningScriptMap.values();
  for (const byPid of scripts) {
    for (const runningScript of byPid.values()) {
      killWorkerScriptWithMessage(runningScript.pid, message);
    }
  }
};

function killWorkerScriptWithMessage(pid: number, message: string): boolean {
  const ws = workerScripts.get(pid);
  if (ws) {
    ws.log("", () => message);
    stopAndCleanUpWorkerScript(ws);
    return true;
  }
  return false;
}

function stopAndCleanUpWorkerScript(ws: WorkerScript): void {
  // Only clean up once.
  // Important: Only this function can set stopFlag!
  if (ws.stopFlag) return;

  //Clean up any ongoing netscriptDelay
  if (ws.delay) clearTimeout(ws.delay);
  ws.delayReject?.(new ScriptDeath(ws));
  ws.runningFn = "";
  const atExit = ws.atExit;
  //Calling ns.exit inside ns.atExit can lead to recursion
  //so the map must be cleared before looping
  ws.atExit = null;

  if (atExit) {
    for (const [id, callback] of atExit) {
      try {
        callback();
      } catch (e: unknown) {
        handleUnknownError(e, ws, `Error running atExit function with id ${id}.\n\n`);
      }
    }
  }

  if (ws.stopFlag) {
    // If atExit() kills the script, we'll already be stopped, don't stop again.
    return;
  }

  ws.stopFlag = true;
  removeWorkerScript(ws);
}

/**
 * Helper function that removes the script being killed from the global pool.
 * Also handles other cleanup-time operations
 *
 * @param {WorkerScript} - Identifier for WorkerScript. Either the object itself, or
 *                                  its index in the global workerScripts array
 */
function removeWorkerScript(workerScript: WorkerScript): void {
  const ip = workerScript.hostname;

  // Get the server on which the script runs
  const server = GetServer(ip);
  if (server == null) {
    console.error(`Could not find server on which this script is running: ${ip}`);
    return;
  }

  // Delete the RunningScript object from that server
  const rs = workerScript.scriptRef;
  const key = scriptKey(rs.filename, rs.args);
  const byPid = server.runningScriptMap.get(key);
  if (!byPid) {
    console.error(`Couldn't find runningScriptMap for key ${key}`);
  } else {
    byPid.delete(workerScript.pid);
    if (byPid.size === 0) {
      server.runningScriptMap.delete(key);
    }
  }

  // Update ram used. Reround to prevent accumulation of error.
  server.updateRamUsed(roundToTwo(server.ramUsed - rs.ramUsage * rs.threads));

  workerScripts.delete(workerScript.pid);
  if (rs.temporary === false) {
    AddRecentScript(workerScript);
  }
}
