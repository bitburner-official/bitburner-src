import { CONSTANTS } from "../Constants";
import { Player } from "@player";
import { BaseServer } from "../Server/BaseServer";
import { Server } from "../Server/Server";
import { RunningScript } from "./RunningScript";
import { getWeakenEffect, processSingleServerGrowth } from "../Server/ServerHelpers";
import { GetServer } from "../Server/AllServers";
import { formatPercent } from "../ui/formatNumber";
import { workerScripts } from "../Netscript/WorkerScripts";
import { scriptKey } from "../utils/helpers/scriptKey";

import type { ScriptFilePath } from "../Paths/ScriptFilePath";

export function scriptCalculateOfflineProduction(runningScript: RunningScript): void {
  //The Player object stores the last update time from when we were online
  const thisUpdate = new Date().getTime();
  const lastUpdate = Player.lastUpdate;
  const timePassed = Math.max((thisUpdate - lastUpdate) / 1000, 0); //Seconds

  //Calculate the "confidence" rating of the script's true production. This is based
  //entirely off of time. We will arbitrarily say that if a script has been running for
  //4 hours (14400 sec) then we are completely confident in its ability
  let confidence = runningScript.onlineRunningTime / 14400;
  if (confidence >= 1) {
    confidence = 1;
  }

  //Data map: [MoneyStolen, NumTimesHacked, NumTimesGrown, NumTimesWeaken]

  // Grow
  for (const hostname of Object.keys(runningScript.dataMap)) {
    if (Object.hasOwn(runningScript.dataMap, hostname)) {
      if (runningScript.dataMap[hostname][2] == 0 || runningScript.dataMap[hostname][2] == null) {
        continue;
      }
      const serv = GetServer(hostname);
      if (serv == null) {
        continue;
      }
      const timesGrown = Math.round(
        ((0.5 * runningScript.dataMap[hostname][2]) / runningScript.onlineRunningTime) * timePassed,
      );
      runningScript.log(`Called on ${serv.hostname} ${timesGrown} times while offline`);
      const host = GetServer(runningScript.server);
      if (host === null) throw new Error("getServer of null key?");
      if (!(serv instanceof Server)) throw new Error("trying to grow a non-normal server");
      const growth = processSingleServerGrowth(serv, timesGrown, host.cpuCores);
      runningScript.log(`'${serv.hostname}' grown by ${formatPercent(growth - 1, 6)} while offline`);
    }
  }

  // Offline EXP gain
  // A script's offline production will always be at most half of its online production.
  const expGain = confidence * (runningScript.onlineExpGained / runningScript.onlineRunningTime) * timePassed;
  Player.gainHackingExp(expGain);

  const moneyGain =
    (runningScript.onlineMoneyMade / Player.playtimeSinceLastAug) * timePassed * CONSTANTS.OfflineHackingIncome;
  // money is given to player during engine load
  Player.scriptProdSinceLastAug += moneyGain;

  // Update script stats
  runningScript.offlineRunningTime += timePassed;
  runningScript.offlineExpGained += expGain;
  runningScript.offlineMoneyMade += moneyGain;

  // Weaken
  for (const hostname of Object.keys(runningScript.dataMap)) {
    if (Object.hasOwn(runningScript.dataMap, hostname)) {
      if (runningScript.dataMap[hostname][3] == 0 || runningScript.dataMap[hostname][3] == null) {
        continue;
      }
      const serv = GetServer(hostname);
      if (serv == null) {
        continue;
      }

      if (!(serv instanceof Server)) throw new Error("trying to weaken a non-normal server");
      const host = GetServer(runningScript.server);
      if (host === null) throw new Error("getServer of null key?");
      const timesWeakened = Math.round(
        ((0.5 * runningScript.dataMap[hostname][3]) / runningScript.onlineRunningTime) * timePassed,
      );
      runningScript.log(`Called weaken() on ${serv.hostname} ${timesWeakened} times while offline`);
      const weakenAmount = getWeakenEffect(runningScript.threads, host.cpuCores);
      serv.weaken(weakenAmount * timesWeakened);
    }
  }
}

//Returns a RunningScript map containing scripts matching the filename and
//arguments on the designated server, or null if none were found
export function findRunningScripts(
  path: ScriptFilePath,
  args: (string | number | boolean)[],
  server: BaseServer,
): Map<number, RunningScript> | null {
  return server.runningScriptMap.get(scriptKey(path, args)) ?? null;
}

//Returns a RunningScript object matching the pid on the
//designated server, and false otherwise
export function findRunningScriptByPid(pid: number, server: BaseServer): RunningScript | null {
  const ws = workerScripts.get(pid);
  // Return null if no ws found or if it's on a different server.
  if (!ws) return null;
  if (ws.scriptRef.server !== server.hostname) return null;
  return ws.scriptRef;
}
