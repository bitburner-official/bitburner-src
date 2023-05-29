import React from "react";

import { Player } from "@player";

import { applyAugmentation } from "../Augmentation/AugmentationHelpers";
import { StaticAugmentations } from "../Augmentation/StaticAugmentations";
import { AugmentationNames } from "../Augmentation/data/AugmentationNames";
import { CONSTANTS } from "../Constants";
import { GraftableAugmentation } from "../PersonObjects/Grafting/GraftableAugmentation";
import { graftingIntBonus } from "../PersonObjects/Grafting/GraftingHelpers";
import { GraftableAugmentations } from "../PersonObjects/Grafting/ui/GraftingRoot";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { Work, WorkType } from "./Work";

export const isGraftingWork = (w: Work | null): w is GraftingWork => w !== null && w.type === WorkType.GRAFTING;

interface GraftingWorkParams {
  augmentation: string;
  singularity: boolean;
}

export class GraftingWork extends Work {
  augmentation: string;
  unitCompleted: number;

  constructor(params?: GraftingWorkParams) {
    super(WorkType.GRAFTING, params?.singularity ?? true);
    this.unitCompleted = 0;
    this.augmentation = params?.augmentation ?? AugmentationNames.Targeting1;
    const gAugs = GraftableAugmentations();
    if (params) Player.loseMoney(gAugs[this.augmentation].cost, "augmentations");
  }

  unitNeeded(): number {
    return new GraftableAugmentation(StaticAugmentations[this.augmentation]).time;
  }

  process(cycles: number): boolean {
    let focusBonus = 1;
    if (!Player.hasAugmentation(AugmentationNames.NeuroreceptorManager, true)) {
      focusBonus = Player.focus ? 1 : CONSTANTS.BaseFocusBonus;
    }

    this.cyclesWorked += cycles;
    this.unitCompleted += CONSTANTS.MilliPerCycle * cycles * graftingIntBonus() * focusBonus;

    return this.unitCompleted >= this.unitNeeded();
  }

  finish(cancelled: boolean): void {
    const augName = this.augmentation;
    if (!cancelled) {
      applyAugmentation({ name: augName, level: 1 });

      if (!Player.hasAugmentation(AugmentationNames.CongruityImplant, true)) {
        Player.entropy += 1;
        Player.applyEntropy(Player.entropy);
      }

      if (!this.singularity) {
        dialogBoxCreate(
          <>
            You've finished grafting {augName}.<br />
            The augmentation has been applied to your body{" "}
            {Player.hasAugmentation(AugmentationNames.CongruityImplant, true) ? "." : ", but you feel a bit off."}
          </>,
        );
      }
    } else if (cancelled && !this.singularity) {
      dialogBoxCreate(
        <>
          You cancelled the grafting of {augName}.
          <br />
          Your money was not returned to you.
        </>,
      );
    }

    // Intelligence gain
    if (!cancelled) {
      Player.gainIntelligenceExp(
        (CONSTANTS.IntelligenceGraftBaseExpGain * this.cyclesWorked * CONSTANTS.MilliPerCycle) / 10000,
      );
    }
  }

  APICopy(): Record<string, unknown> {
    return {
      type: this.type,
      cyclesWorked: this.cyclesWorked,
      augmentation: this.augmentation,
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("GraftingWork", this);
  }

  /** Initializes a GraftingWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): GraftingWork {
    return Generic_fromJSON(GraftingWork, value.data);
  }
}

constructorsForReviver.GraftingWork = GraftingWork;
