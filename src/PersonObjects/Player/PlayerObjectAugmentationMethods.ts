/** Augmentation-related methods for the Player class (PlayerObject) */
import { Multipliers } from "@nsdefs";
import { calculateEntropy } from "../Grafting/EntropyAccumulation";

import type { PlayerObject } from "./PlayerObject";

export function applyEntropy(this: PlayerObject, stacks = 1): Multipliers {
  // Re-apply all multipliers
  this.reapplyAllAugmentations();
  this.reapplyAllSourceFiles();

  const entropyMults = calculateEntropy(stacks);
	this.mults = entropyMults;

	return entropyMults;
}
