import { Player } from "@player";
import { DarknetState, hasDarknetBonusTime } from "../models/DarknetState";
import { formatNumber } from "../../ui/formatNumber";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { NetscriptContext } from "../../Netscript/APIWrapper";
import { helpers } from "../../Netscript/NetscriptHelpers";
import { addCacheToServer } from "./cacheFiles";
import type { DarknetServer } from "../../Server/DarknetServer";

export const getPhishingAttackSpeed = () => Math.max(10000 * (400 / (400 + Player.skills.charisma)), 200);
const getPhishingCacheCooldownDuration = () => (hasDarknetBonusTime() ? 12_000 : 24_000);

export const handlePhishingAttack = (ctx: NetscriptContext, server: DarknetServer) => {
  const threads = ctx.workerScript.scriptRef.threads;
  const xpGained = Player.mults.charisma_exp * threads * 50 * ((200 + Player.skills.charisma) / 200);
  Player.gainCharismaExp(xpGained);

  const timeSinceLastRewardCache = new Date().getTime() - DarknetState.lastPhishingCacheTime.getTime();
  const rewardCacheChance = 0.005 * Player.mults.crime_success * threads * ((400 + Player.skills.charisma) / 400);
  const moneyRewardChance = 0.05 * Player.mults.crime_success * ((100 + Player.skills.charisma) / 100);
  const cooldown = getPhishingCacheCooldownDuration();

  if (timeSinceLastRewardCache > cooldown && Math.random() < rewardCacheChance) {
    addCacheToServer(server);
    DarknetState.lastPhishingCacheTime = new Date();
    const result = `Phishing attack succeeded! Found a cache file. (Gained ${formatNumber(xpGained, 1)} cha xp)`;
    helpers.log(ctx, () => result);
    return {
      success: true,
      message: result,
    };
  } else if (Math.random() < moneyRewardChance) {
    const randomFactor = Math.random() * 0.3 + 0.9;
    const bonusTimeFactor = hasDarknetBonusTime() ? 1.3 : 1;
    const moneyReward =
      1e4 *
      Player.mults.crime_money *
      threads *
      ((50 + Player.skills.charisma) / 50) *
      bonusTimeFactor *
      randomFactor *
      currentNodeMults.DarknetMoneyMultiplier;
    Player.gainMoney(moneyReward, "darknet");
    const result = `Phishing attack succeeded! $${formatNumber(moneyReward, 2)} retrieved. (Gained ${formatNumber(
      xpGained,
      1,
    )} cha xp)`;
    helpers.log(ctx, () => result);
    return {
      success: true,
      message: result,
    };
  }
  const result = `There were no takers on that phishing attempt. (Gained ${formatNumber(xpGained, 1)} cha xp)`;
  helpers.log(ctx, () => result);
  return {
    success: false,
    message: result,
  };
};
