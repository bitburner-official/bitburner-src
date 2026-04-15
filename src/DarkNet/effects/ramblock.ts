import { Player } from "@player";
import { addClue } from "./effects";
import { formatNumber, formatRam } from "../../ui/formatNumber";
import { logger } from "./offlineServerHandling";
import type { NetscriptContext } from "../../Netscript/APIWrapper";
import type { DarknetServer } from "../../Server/DarknetServer";
import { addCacheToServer } from "./cacheFiles";
import { DarknetState } from "../models/DarknetState";
import { getAllMovableDarknetServers } from "../utils/darknetNetworkUtils";
import { CompletedProgramName } from "@enums";
import type { DarknetServerData, Person as IPerson } from "@nsdefs";
import { clampNumber } from "../../utils/helpers/clampNumber";
import { ResponseCodeEnum } from "../Enums";
import { isLabyrinthServer } from "./labyrinth";
import { roundToTwo } from "../../utils/helpers/roundToTwo";

/*
 * Handles the effects of removing some blocked RAM from a Darknet server.
 */
export const handleRamBlockRemoved = (ctx: NetscriptContext, server: DarknetServer) => {
  const threads = ctx.workerScript.scriptRef.threads;
  const difficulty = server.difficulty + 1;

  const ramBlockRemoved = getRamBlockRemoved(server, threads);
  server.blockedRam = roundToTwo(server.blockedRam - ramBlockRemoved);
  server.updateRamUsed(server.ramUsed - ramBlockRemoved);

  if (server.blockedRam <= 0) {
    handleRamBlockClearedRewards(server);
  }
  const xpGained = Player.mults.charisma_exp * threads * 10 * 1.1 ** difficulty;
  Player.gainCharismaExp(xpGained);

  const result = `Liberated ${formatRam(
    ramBlockRemoved,
    4,
  )} of RAM from the server owner's processes. (Gained ${formatNumber(xpGained, 1)} cha xp.)`;
  logger(ctx)(result);
  return {
    success: true,
    code: ResponseCodeEnum.Success,
    message: result,
  };
};

/*
 * Handles the rewards for fully clearing a Darknet server's RAM block.
 */
export const handleRamBlockClearedRewards = (server: DarknetServer) => {
  if (!isLabyrinthServer(server.hostname)) {
    addCacheToServer(server, false);
  }
  if (Math.random() < 0.3) {
    addClue(server);
  }

  const stormSeedChance = 0.15;
  const timeSinceLastStorm = Date.now() - DarknetState.lastStormTime.getTime();
  const stormFileExists = getAllMovableDarknetServers().some((s) =>
    s.programs.includes(CompletedProgramName.stormSeed),
  );
  if (timeSinceLastStorm > 30 * 60 * 1000 && !stormFileExists && Math.random() < stormSeedChance) {
    server.programs.push(CompletedProgramName.stormSeed);
  }
};

/*
 * Calculates the amount of RAM block that is removed from a Darknet server, based on the number of threads and the player's charisma.
 */
export const getRamBlockRemoved = (darknetServerData: DarknetServerData, threads = 1, player: IPerson = Player) => {
  const difficulty = darknetServerData.difficulty;
  const remainingRamBlock = darknetServerData.blockedRam;
  const charismaFactor = 1 + player.skills.charisma / 100;
  const difficultyFactor = 2 * 0.92 ** (difficulty + 1);
  const baseAmount = 0.02;
  return roundToTwo(clampNumber(baseAmount * difficultyFactor * threads * charismaFactor, 0, remainingRamBlock));
};

/*
 * Sets the RAM used on all Darknet servers to account for any changes in their RAM blocks.
 */
export const applyRamBlocks = () => {
  const servers = getAllMovableDarknetServers();
  for (const server of servers) {
    server.updateRamUsed(server.blockedRam);
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

  return roundToTwo([maxRam, maxRam - 8, maxRam - 64, maxRam / 2][Math.floor(Math.random() * 4)]);
};
