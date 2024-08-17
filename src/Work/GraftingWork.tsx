import React from "react";
import { CONSTANTS } from "../Constants";
import { AugmentationName } from "@enums";
import { GraftableAugmentations } from "../PersonObjects/Grafting/ui/GraftingRoot";
import { Player } from "@player";
import { Work, WorkType } from "./Work";
import { graftingIntBonus } from "../PersonObjects/Grafting/GraftingHelpers";
import { applyAugmentation } from "../Augmentation/AugmentationHelpers";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { GraftableAugmentation } from "../PersonObjects/Grafting/GraftableAugmentation";
import { Augmentations } from "../Augmentation/Augmentations";
import { PromisePair } from "../Types/Promises";
import { getKeyList } from "../utils/helpers/getKeyList";

export const isGraftingWork = (w: Work | null): w is GraftingWork => w !== null && w.type === WorkType.GRAFTING;

interface GraftingWorkParams {
  augmentation: AugmentationName;
  singularity: boolean;
}

export class GraftingWork extends Work {
  augmentation: AugmentationName;
  unitCompleted: number;
  unitRate: number;
  completionPromisePair: PromisePair<void> = { promise: null, resolve: null };

  get completion(): Promise<void> {
    if (!this.completionPromisePair.promise) {
      this.completionPromisePair.promise = new Promise((r) => (this.completionPromisePair.resolve = r));
    }
    return this.completionPromisePair.promise;
  }

  constructor(params?: GraftingWorkParams) {
    super(WorkType.GRAFTING, params?.singularity ?? true);
    this.unitCompleted = 0;
    this.unitRate = 0;
    this.augmentation = params?.augmentation ?? AugmentationName.Targeting1;
    const gAugs = GraftableAugmentations();
    if (params) Player.loseMoney(gAugs[this.augmentation].cost, "augmentations");
  }

  unitNeeded(): number {
    return new GraftableAugmentation(Augmentations[this.augmentation]).time;
  }

  process(cycles: number): boolean {
    const focusBonus = Player.focusPenalty();
    this.cyclesWorked += cycles;
    this.unitRate = CONSTANTS.MilliPerCycle * graftingIntBonus() * focusBonus;
    this.unitCompleted += this.unitRate * cycles;
    return this.unitCompleted >= this.unitNeeded();
  }

  finish(cancelled: boolean): void {
    const augName = this.augmentation;
    if (!cancelled) {
      applyAugmentation({ name: augName, level: 1 });

      // Remove this augmentation from the list of queued augmentations.
      for (let i = 0; i < Player.queuedAugmentations.length; ++i) {
        if (Player.queuedAugmentations[i].name === augName) {
          Player.queuedAugmentations.splice(i, 1);
          break;
        }
      }

      if (!Player.hasAugmentation(AugmentationName.CongruityImplant, true)) {
        Player.entropy += 1;
        Player.applyEntropy(Player.entropy);
      }

      if (!this.singularity) {
        dialogBoxCreate(
          <>
            You've finished grafting {augName}.<br />
            The augmentation has been applied to your body
            {Player.hasAugmentation(AugmentationName.CongruityImplant, true) ? "." : ", but you feel a bit off."}
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

    if (this.completionPromisePair.resolve) {
      this.completionPromisePair.resolve();
      this.completionPromisePair.resolve = null;
      this.completionPromisePair.promise = null;
    }
  }

  APICopy() {
    return {
      type: WorkType.GRAFTING as const,
      cyclesWorked: this.cyclesWorked,
      augmentation: this.augmentation,
      completion: this.completion,
    };
  }

  static savedKeys = getKeyList(GraftingWork, { removedKeys: ["completionPromisePair"] });

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("GraftingWork", this, GraftingWork.savedKeys);
  }

  /** Initializes a GraftingWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): GraftingWork {
    return Generic_fromJSON(GraftingWork, value.data, GraftingWork.savedKeys);
  }
}

constructorsForReviver.GraftingWork = GraftingWork;
