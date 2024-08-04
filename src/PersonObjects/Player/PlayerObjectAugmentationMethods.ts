/** Augmentation-related methods for the Player class (PlayerObject) */
import { calculateEntropy } from "../Grafting/EntropyAccumulation";
import { staneksGift } from "../../CotMG/Helper";
import { updateGoMults } from "../../Go/effects/effect";

import type { PlayerObject } from "./PlayerObject";

export function applyEntropy(this: PlayerObject, stacks = 1): void {
  // Save the current HP ratio.
  const currentHpRatio = this.hp.current / this.hp.max;

  // Re-apply all multipliers
  this.reapplyAllAugmentations();
  this.reapplyAllSourceFiles();

  this.mults = calculateEntropy(stacks);
  staneksGift.updateMults();
  updateGoMults();

  /**
   * The ratio of (hp.current / hp.max) may be wrong after multiple function calls above. We need to recalculate
   * hp.current based on the saved value.
   */
  this.hp.current = Math.round(this.hp.max * Math.min(currentHpRatio, 1));
}
