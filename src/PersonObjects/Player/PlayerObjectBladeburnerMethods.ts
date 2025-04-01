import { canAccessBitNodeFeature } from "../../BitNode/BitNodeUtils";
import { Bladeburner } from "../../Bladeburner/Bladeburner";
import { AugmentationName } from "@enums";
import type { PlayerObject } from "./PlayerObject";

export function canAccessBladeburner(this: PlayerObject): boolean {
  return (canAccessBitNodeFeature(6) || canAccessBitNodeFeature(7)) && !this.bitNodeOptions.disableBladeburner;
}

export function startBladeburner(this: PlayerObject): void {
  this.bladeburner = new Bladeburner();
  this.bladeburner.init();
  // Give Blades Simulacrum if you have unlocked it
  if (this.activeSourceFileLvl(7) >= 3) {
    this.augmentations.push({
      name: AugmentationName.BladesSimulacrum,
      level: 1,
    });
  }
}
