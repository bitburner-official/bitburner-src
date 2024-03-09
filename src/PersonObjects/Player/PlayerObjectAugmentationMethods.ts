/** Augmentation-related methods for the Player class (PlayerObject) */
import { calculateEntropy } from "../Grafting/EntropyAccumulation";
import { staneksGift } from "../../CotMG/Helper";
import { updateGoMults } from "../../Go/effects/effect";

import type { PlayerObject } from "./PlayerObject";

export function applyEntropy(this: PlayerObject, stacks = 1): void {
  // Re-apply all multipliers
  this.reapplyAllAugmentations();
  this.reapplyAllSourceFiles();

  this.mults = calculateEntropy(stacks);
  staneksGift.updateMults();
  updateGoMults();
}
