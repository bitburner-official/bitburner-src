import { Player } from "@player";
import { AugmentationName, FactionName } from "@enums";
import { Augmentations } from "../../Augmentation/Augmentations";
import { calculateIntelligenceBonus } from "../formulas/intelligence";
import { GraftableAugmentation } from "./GraftableAugmentation";
import { getRecordEntries } from "../../Types/Record";

export const getGraftingAvailableAugs = (): AugmentationName[] => {
  const augs: AugmentationName[] = [];

  for (const [augName, aug] of getRecordEntries(Augmentations)) {
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
  return calculateIntelligenceBonus(Player.skills.intelligence, 1);
};

export const calculateGraftingTimeWithBonus = (aug: GraftableAugmentation): number => {
  const baseTime = aug.time;
  return baseTime / graftingIntBonus();
};
