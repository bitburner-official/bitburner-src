import { helpers } from "../../Netscript/NetscriptHelpers";
import { Player } from "@player";
import { getRamBlockRemoved, handleRamBlockClearedRewards } from "./effects";
import { formatNumber } from "../../ui/formatNumber";
import { getFailureResult, logger } from "./offlineServerHandling";
import type { NetscriptContext } from "../../Netscript/APIWrapper";
import { getDarknetServerSafely } from "../utils/darknetServerUtils";

export const handleRamBlockRemoved = (ctx: NetscriptContext, hostname: string) => {
  const onlineConnectionCheck = getFailureResult(ctx, hostname, { requireDirectConnection: true });
  if (!onlineConnectionCheck.success) {
    return helpers.netscriptDelay(ctx, 100).then(() => ({
      success: false,
      message: onlineConnectionCheck.message,
    }));
  }
  const server = getDarknetServerSafely(hostname);
  if (!server) {
    throw helpers.errorMessage(ctx, `Server ${hostname} not found. It may have gone offline.`);
  }

  if (server.ramBlock <= 0) {
    const result = `Server ${server.hostname} has no host-owned ram left to reallocate.`;
    logger(ctx)(result);
    return {
      success: false,
      message: result,
    };
  }

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
