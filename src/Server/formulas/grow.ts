import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Person as IPerson, Server as IServer } from "@nsdefs";
import { ServerConstants } from "../data/Constants";

// Returns the log of the growth rate. When passing 1 for threads, this gives a useful constant.
export function calculateServerGrowthLog(server: IServer, threads: number, p: IPerson, cores = 1): number {
  if (!server.serverGrowth) return -Infinity;
  const hackDifficulty = server.hackDifficulty ?? 100;
  const numServerGrowthCycles = Math.max(threads, 0);

  //Get adjusted growth log, which accounts for server security
  //log1p computes log(1+p), it is far more accurate for small values.
  let adjGrowthLog = Math.log1p(ServerConstants.ServerBaseGrowthIncr / hackDifficulty);
  if (adjGrowthLog >= ServerConstants.ServerMaxGrowthLog) {
    adjGrowthLog = ServerConstants.ServerMaxGrowthLog;
  }

  //Calculate adjusted server growth rate based on parameters
  const serverGrowthPercentage = server.serverGrowth / 100;
  const serverGrowthPercentageAdjusted = serverGrowthPercentage * currentNodeMults.ServerGrowthRate;

  //Apply serverGrowth for the calculated number of growth cycles
  const coreBonus = 1 + (cores - 1) * (1 / 16);
  // It is critical that numServerGrowthCycles (aka threads) is multiplied last,
  // so that it rounds the same way as numCycleForGrowthCorrected.
  return adjGrowthLog * serverGrowthPercentageAdjusted * p.mults.hacking_grow * coreBonus * numServerGrowthCycles;
}

export function calculateServerGrowth(server: IServer, threads: number, p: IPerson, cores = 1): number {
  if (!server.serverGrowth) return 0;
  return Math.exp(calculateServerGrowthLog(server, threads, p, cores));
}
