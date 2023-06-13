import type { AugmentationName } from "./Enums";

export class PlayerOwnedAugmentation {
  level = 1;
  name: AugmentationName;

  constructor(name: AugmentationName) {
    this.name = name;
  }
}
