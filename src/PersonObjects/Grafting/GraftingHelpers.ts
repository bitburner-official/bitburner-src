import { StaticAugmentations } from "../../Augmentation/StaticAugmentations";
import { GraftableAugmentation } from "./GraftableAugmentation";
import { Player } from "@player";
import { calculateIntelligenceBonus } from "../formulas/intelligence";
import { FactionName } from "../../Faction/data/Enums";

export const getGraftingAvailableAugs = (): string[] => {
  const augs: string[] = [];

  for (const [augName, aug] of Object.entries(StaticAugmentations)) {
    if (Player.factions.includes(FactionName.Bladeburners)) {
      if (aug.isSpecial && !aug.factions.includes(FactionName.Bladeburners)) continue;
    } else {
      if (aug.isSpecial) continue;
    }
    augs.push(augName);
  }

  return augs.filter((augmentation: string) => !Player.hasAugmentation(augmentation));
};

export const graftingIntBonus = (): number => {
  return 1 + (calculateIntelligenceBonus(Player.skills.intelligence, 3) - 1) / 3;
};

export const calculateGraftingTimeWithBonus = (aug: GraftableAugmentation): number => {
  const baseTime = aug.time;
  return baseTime / graftingIntBonus();
};
