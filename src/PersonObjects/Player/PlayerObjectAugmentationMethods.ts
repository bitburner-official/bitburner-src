/** Augmentation-related methods for the Player class (PlayerObject) */
import { calculateEntropy } from "../Grafting/EntropyAccumulation";
import { staneksGift } from "../../CotMG/Helper";
import { updateGoMults } from "../../Go/effects/effect";

import type { PlayerObject } from "./PlayerObject";

export function applyEntropy(this: PlayerObject, stacks = 1): void {
  // Save the current value of this.hp.
  const currentHp = this.hp.current;
  const currentMaxHp = this.hp.max;

  // Re-apply all multipliers
  this.reapplyAllAugmentations();
  this.reapplyAllSourceFiles();

  this.mults = calculateEntropy(stacks);
  staneksGift.updateMults();
  updateGoMults();

  if (this.hp.max === currentMaxHp) {
    /**
     * When the max HP is not changed, the current HP may still be changed after multiple function calls above. We need
     * to reset hp.current to the saved value.
     */
    this.hp.current = currentHp;
  } else {
    /**
     * The ratio of (hp.current / hp.max) may be wrong after multiple function calls above. We need to recalculate
     * hp.current based on the saved value.
     */
    this.hp.current = Math.round(this.hp.max * Math.min(currentHp / currentMaxHp, 1));
  }
}
