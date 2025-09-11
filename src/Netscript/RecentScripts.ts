import type { RunningScript } from "../Script/RunningScript";
import type { WorkerScript } from "./WorkerScript";
import { Settings } from "../Settings/Settings";

export const recentScripts: RecentScript[] = [];
let recentScriptId = 0;

export function AddRecentScript(workerScript: WorkerScript): void {
  if (recentScripts.find((r) => r.runningScript.pid === workerScript.pid)) return;

  const killedTime = new Date();
  ++recentScriptId;
  recentScripts.unshift({
    id: recentScriptId,
    timeOfDeath: killedTime,
    runningScript: workerScript.scriptRef,
  });

  while (recentScripts.length > Settings.MaxRecentScriptsCapacity) {
    recentScripts.pop();
  }
}

export interface RecentScript {
  id: number;
  timeOfDeath: Date;
  runningScript: RunningScript;
}
