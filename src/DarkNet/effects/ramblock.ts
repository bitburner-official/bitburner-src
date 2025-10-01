import { Player } from "@player";
import { getRamBlockRemoved, handleRamBlockClearedRewards } from "./effects";
import { formatNumber } from "../../ui/formatNumber";
import { logger } from "./offlineServerHandling";
import type { NetscriptContext } from "../../Netscript/APIWrapper";
import type { DarknetServer } from "../../Server/DarknetServer";

/**
 * WIP-@fico: Do we need a separate function/file? This block of code is only used by memoryReallocation in
 * src\NetscriptFunctions\Darknet.ts.
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
