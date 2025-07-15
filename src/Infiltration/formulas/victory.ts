import { Player } from "@player";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { LocationsMetadata } from "../../Locations/data/LocationsMetadata";
import { AugmentationName } from "@enums";
import { Faction } from "../../Faction/Faction";
import { calculateMarketDemandMultiplier } from "./game";

export function calculateSellInformationCashReward(
  reward: number,
  maxLevel: number,
  startingSecurityLevel: number,
  timeStamp: number,
): number {
  const levelBonus = maxLevel * Math.pow(1.01, maxLevel);
  const marketRateMultiplier = calculateMarketDemandMultiplier(timeStamp);

  return (
    Math.pow(reward + 1, 2) *
    Math.pow(startingSecurityLevel, 3) *
    marketRateMultiplier *
    3e3 *
    levelBonus *
    (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 1.5 : 1) *
    currentNodeMults.InfiltrationMoney
  );
}

export function calculateTradeInformationRepReward(
  reward: number,
  maxLevel: number,
  startingSecurityLevel: number,
  timeStamp: number,
): number {
  const levelBonus = maxLevel * Math.pow(1.005, maxLevel);
  const marketRateMultiplier = calculateMarketDemandMultiplier(timeStamp);
  let balanceMultiplier;
  if (startingSecurityLevel < 4) {
    balanceMultiplier = 0.45;
  } else if (startingSecurityLevel < 5) {
    balanceMultiplier = 0.4;
  } else if (startingSecurityLevel < 7) {
    balanceMultiplier = 0.35;
  } else if (startingSecurityLevel < 12) {
    balanceMultiplier = 0.3;
  } else if (startingSecurityLevel < 14) {
    balanceMultiplier = 0.26;
  } else if (startingSecurityLevel < 15) {
    balanceMultiplier = 0.25;
  } else {
    balanceMultiplier = 0.2;
  }

  return (
    Math.pow(reward + 1, 1.1) *
    Math.pow(startingSecurityLevel, 1.1) *
    balanceMultiplier *
    marketRateMultiplier *
    30 *
    levelBonus *
    (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 1.2 : 1) *
    currentNodeMults.InfiltrationRep
  );
}

export function calculateInfiltratorsRepReward(
  faction: Faction,
  maxLevel: number,
  startingSecurityLevel: number,
  timeStamp: number,
): number {
  const maxStartingSecurityLevel = LocationsMetadata.reduce((acc, data): number => {
    const startingSecurityLevel = data.infiltrationData?.startingSecurityLevel || 0;
    return acc > startingSecurityLevel ? acc : startingSecurityLevel;
  }, 0);
  const baseRepGain = (startingSecurityLevel / maxStartingSecurityLevel) * 5000;
  const balanceMultiplier = 0.8 + 0.05 * (maxLevel - 5);
  const marketRateMultiplier = calculateMarketDemandMultiplier(timeStamp);

  return (
    baseRepGain *
    balanceMultiplier *
    marketRateMultiplier *
    (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 2 : 1) *
    (1 + faction.favor / 100)
  );
}
