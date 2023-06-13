import { CONSTANTS } from "../../Constants";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Person as IPerson, Server as IServer } from "@nsdefs";

export function calculateServerGrowth(server: IServer, threads: number, p: IPerson, cores = 1): number {
  if (!server.serverGrowth) return 0;
  const hackDifficulty = server.hackDifficulty ?? 100;
  const numServerGrowthCycles = Math.max(Math.floor(threads), 0);

  //Get adjusted growth rate, which accounts for server security
  const growthRate = CONSTANTS.ServerBaseGrowthRate;
  let adjGrowthRate = 1 + (growthRate - 1) / hackDifficulty;
  if (adjGrowthRate > CONSTANTS.ServerMaxGrowthRate) {
    adjGrowthRate = CONSTANTS.ServerMaxGrowthRate;
  }

  //Calculate adjusted server growth rate based on parameters
  const serverGrowthPercentage = server.serverGrowth / 100;
  const numServerGrowthCyclesAdjusted =
    numServerGrowthCycles * serverGrowthPercentage * currentNodeMults.ServerGrowthRate;

  //Apply serverGrowth for the calculated number of growth cycles
  const coreBonus = 1 + (cores - 1) / 16;
  return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * p.mults.hacking_grow * coreBonus);
}
