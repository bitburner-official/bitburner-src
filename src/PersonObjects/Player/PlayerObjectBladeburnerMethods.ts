import { canAccessBitNodeFeature } from "../../BitNode/BitNodeUtils";
import { Bladeburner } from "../../Bladeburner/Bladeburner";
import { AugmentationName } from "@enums";
import type { PlayerObject } from "./PlayerObject";
import { applyAugmentation } from "../../Augmentation/AugmentationHelpers";

export function canAccessBladeburner(this: PlayerObject): boolean {
  return (canAccessBitNodeFeature(6) || canAccessBitNodeFeature(7)) && !this.bitNodeOptions.disableBladeburner;
}

export function startBladeburner(this: PlayerObject): void {
  this.bladeburner = new Bladeburner();
  this.bladeburner.init();
  // If Blade's Simulacrum is unlocked, gives it to the Player and bans COTMG in faction rumours
  if (this.activeSourceFileLvl(7) >= 3) {
    applyAugmentation({ name: AugmentationName.BladesSimulacrum, level: 1 });
  }
}
