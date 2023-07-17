import { Player } from "@player";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { LocationsMetadata } from "../../Locations/data/LocationsMetadata";
import { AugmentationName } from "@enums";
import { Faction } from "../../Faction/Faction";

export function calculateSellInformationCashReward(reward: number, maxLevel: number, difficulty: number): number {
  const levelBonus = maxLevel * Math.pow(1.01, maxLevel);

  return (
    Math.pow(reward + 1, 2) *
    Math.pow(difficulty, 3) *
    3e3 *
    levelBonus *
    (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 1.5 : 1) *
    currentNodeMults.InfiltrationMoney
  );
}

export function calculateTradeInformationRepReward(reward: number, maxLevel: number, difficulty: number): number {
  const levelBonus = maxLevel * Math.pow(1.01, maxLevel);

  return (
    Math.pow(reward + 1, 1.1) *
    Math.pow(difficulty, 1.2) *
    30 *
    levelBonus *
    (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 1.5 : 1) *
    currentNodeMults.InfiltrationRep
  );
}

export function calculateInfiltratorsRepReward(faction: Faction, difficulty: number): number {
  const maxStartingSecurityLevel = LocationsMetadata.reduce((acc, data): number => {
    const startingSecurityLevel = data.infiltrationData?.startingSecurityLevel || 0;
    return acc > startingSecurityLevel ? acc : startingSecurityLevel;
  }, 0);
  const baseRepGain = (difficulty / maxStartingSecurityLevel) * 5000;

  return (
    baseRepGain * (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 2 : 1) * (1 + faction.favor / 100)
  );
}
