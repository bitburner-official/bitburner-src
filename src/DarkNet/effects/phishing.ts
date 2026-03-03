import { Player } from "@player";
import { DarknetState, hasDarknetBonusTime } from "../models/DarknetState";
import { formatNumber } from "../../ui/formatNumber";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { NetscriptContext } from "../../Netscript/APIWrapper";
import { helpers } from "../../Netscript/NetscriptHelpers";
import { addCacheToServer } from "./cacheFiles";
import type { DarknetServer } from "../../Server/DarknetServer";
import { ResponseCodeEnum } from "../Enums";
import { isLabyrinthServer } from "./labyrinth";
import { phishingRewardCooldownReached } from "./effects";

export const getPhishingAttackSpeed = () => Math.max(10000 * (400 / (400 + Player.skills.charisma)), 200);
const getPhishingCacheCooldownDuration = () => (hasDarknetBonusTime() ? 12_000 : 24_000);

export const handlePhishingAttack = (ctx: NetscriptContext, server: DarknetServer) => {
  const threads = ctx.workerScript.scriptRef.threads;
  const xpReward = Player.mults.charisma_exp * threads * 50 * ((200 + Player.skills.charisma) / 200);

  const timeSinceLastRewardCache = new Date().getTime() - DarknetState.lastPhishingCacheTime.getTime();
  const rewardCacheChance = 0.005 * Player.mults.crime_success * threads * ((400 + Player.skills.charisma) / 400);
  const moneyRewardChance = 0.05 * Player.mults.crime_success * ((200 + Player.skills.charisma) / 200);
  const cacheCooldown = getPhishingCacheCooldownDuration();
  const rewardCooldown = phishingRewardCooldownReached();
  const isLabServer = isLabyrinthServer(server.hostname);

  if (timeSinceLastRewardCache > cacheCooldown && Math.random() < rewardCacheChance && !isLabServer) {
    addCacheToServer(server);
    Player.gainCharismaExp(xpReward);
    DarknetState.lastPhishingCacheTime = new Date();
    const result = `Phishing attack succeeded! Found a cache file. (Gained ${formatNumber(xpReward, 1)} cha xp)`;
    helpers.log(ctx, () => result);
    return {
      success: true,
      code: ResponseCodeEnum.Success,
      message: result,
    };
  } else if (Math.random() < moneyRewardChance && rewardCooldown) {
    const randomFactor = Math.random() * 0.3 + 0.9;
    const bonusTimeFactor = hasDarknetBonusTime() ? 1.3 : 1;
    const depthFactor = 0.1 + server.depth * 0.05;
    const moneyReward =
      1000 *
      Player.mults.crime_money *
      depthFactor *
      threads *
      ((200 + Player.skills.charisma) / 200) *
      bonusTimeFactor *
      randomFactor *
      currentNodeMults.DarknetMoneyMultiplier;
    Player.gainMoney(moneyReward, "darknet");
    Player.gainCharismaExp(xpReward);
    const result = `Phishing attack succeeded! $${formatNumber(moneyReward, 2)} retrieved. (Gained ${formatNumber(
      xpReward,
      1,
    )} cha xp)`;
    helpers.log(ctx, () => result);
    return {
      success: true,
      code: ResponseCodeEnum.Success,
      message: result,
    };
  }
  Player.gainCharismaExp(xpReward / 4);
  const result = `There were no takers on that phishing attempt. (Gained ${formatNumber(xpReward / 4, 1)} cha xp)`;
  helpers.log(ctx, () => result);
  return {
    success: false,
    code: ResponseCodeEnum.PhishingFailed,
    message: result,
  };
};
