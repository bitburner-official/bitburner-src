import { Player } from "@player";
import { addClue } from "./effects";
import { formatNumber } from "../../ui/formatNumber";
import { logger } from "./offlineServerHandling";
import type { NetscriptContext } from "../../Netscript/APIWrapper";
import type { DarknetServer } from "../../Server/DarknetServer";
import { addCacheToServer } from "./cacheFiles";
import { DarknetState } from "../models/DarknetState";
import { getAllMobileDarknetServers } from "../utils/darknetNetworkUtils";
import { CompletedProgramName } from "@enums";
import { Person as IPerson } from "@nsdefs";
import { clampNumber } from "../../utils/helpers/clampNumber";

/*
 * Handles the effects of removing some blocked RAM from a Darknet server.
 */
export const handleRamBlockRemoved = (ctx: NetscriptContext, server: DarknetServer) => {
  const threads = ctx.workerScript.scriptRef.threads;
  const difficulty = server.difficulty + 1;
  const xpGained =
    Player.mults.charisma_exp * threads * 10 * 1.1 ** difficulty * ((200 + Player.skills.charisma) / 200);
  Player.gainCharismaExp(xpGained);

  const ramBlockRemoved = getRamBlockRemoved(server, threads);
  server.ramBlock -= ramBlockRemoved;
  server.updateRamUsed(server.ramUsed - ramBlockRemoved);

  if (server.ramBlock <= 0) {
    handleRamBlockClearedRewards(server);
  }

  const result = `Liberated ${formatNumber(
    ramBlockRemoved,
    4,
  )}gb of RAM from the server owner's processes. (Gained ${formatNumber(xpGained, 1)} cha xp.)`;
  logger(ctx)(result);
  return {
    success: true,
    message: result,
  };
};

/*
 * Handles the rewards for fully clearing a Darknet server's RAM block.
 */
export const handleRamBlockClearedRewards = (server: DarknetServer) => {
  addCacheToServer(server);
  if (Math.random() < 0.3) {
    addClue(server);
  }

  const stormSeedChance = 0.15;
  const timeSinceLastStorm = Date.now() - DarknetState.lastStormTime.getTime();
  const stormFileExists = getAllMobileDarknetServers().some((s) => s.programs.includes(CompletedProgramName.stormSeed));
  if (timeSinceLastStorm > 30 * 60 * 1000 && !stormFileExists && Math.random() < stormSeedChance) {
    server.programs.push(CompletedProgramName.stormSeed);
  }
};

/*
 * Calculates the amount of RAM block that is removed from a Darknet server, based on the number of threads and the player's charisma.
 */
export const getRamBlockRemoved = (server: DarknetServer, threads: number = 1, player: IPerson = Player) => {
  const difficulty = server.difficulty;
  const remainingRamBlock = server.ramBlock;
  const charismaFactor = 1 + player.skills.charisma / 100;
  const difficultyFactor = 2 * 0.92 ** (difficulty + 1);
  const baseAmount = 0.02;
  return clampNumber(baseAmount * difficultyFactor * threads * charismaFactor, 0, remainingRamBlock);
};

/*
 * Sets the RAM used on all Darknet servers to account for any changes in their RAM blocks.
 */
export const applyRamBlocks = () => {
  const servers = getAllMobileDarknetServers();
  for (const server of servers) {
    server.updateRamUsed(server.ramBlock ?? 0);
  }
};

/*
 * Determines a random amount of blocked RAM to assign to a Darknet server, based on its maximum RAM.
 */
export const getRamBlock = (maxRam: number): number => {
  if (maxRam === 16) {
    return [0, 1, 2][Math.floor(Math.random() * 2)];
  }
  if (maxRam <= 32) {
    return [0, 2, 4][Math.floor(Math.random() * 2)];
  }

  if (maxRam <= 64) {
    return [16, 32, maxRam - 8][Math.floor(Math.random() * 3)];
  }

  return [maxRam, maxRam - 8, maxRam - 64, maxRam / 2][Math.floor(Math.random() * 4)];
};
