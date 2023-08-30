import type { RunningScript } from "../Script/RunningScript";
import type { WorkerScript } from "./WorkerScript";
import { Settings } from "../Settings/Settings";

export const recentScripts: RecentScript[] = [];

export function AddRecentScript(workerScript: WorkerScript): void {
  if (recentScripts.find((r) => r.runningScript.pid === workerScript.pid)) return;

  const killedTime = new Date();
  recentScripts.unshift({
    timeOfDeath: killedTime,
    runningScript: workerScript.scriptRef,
  });

  while (recentScripts.length > Settings.MaxRecentScriptsCapacity) {
    recentScripts.pop();
  }
}

export interface RecentScript {
  timeOfDeath: Date;
  runningScript: RunningScript;
}
