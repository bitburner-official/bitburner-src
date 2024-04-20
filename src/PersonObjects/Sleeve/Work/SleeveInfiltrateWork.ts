import type { PromisePair } from "../../../Types/Promises";
import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { SleeveWorkClass, SleeveWorkType } from "./Work";
import { CONSTANTS } from "../../../Constants";
import { getKeyList } from "../../../utils/helpers/getKeyList";

const infiltrateCycles = 60000 / CONSTANTS.MilliPerCycle;

export const isSleeveInfiltrateWork = (w: SleeveWorkClass | null): w is SleeveInfiltrateWork =>
  w !== null && w.type === SleeveWorkType.INFILTRATE;

export class SleeveInfiltrateWork extends SleeveWorkClass {
  type: SleeveWorkType.INFILTRATE = SleeveWorkType.INFILTRATE;
  cyclesWorked = 0;
  nextCompletionPair: PromisePair<void> = { promise: null, resolve: null };

  cyclesNeeded(): number {
    return infiltrateCycles;
  }

  process(sleeve: Sleeve, cycles: number) {
    if (!Player.bladeburner) return sleeve.stopWork();
    this.cyclesWorked += cycles;
    if (this.cyclesWorked > this.cyclesNeeded()) {
      this.cyclesWorked -= this.cyclesNeeded();
      Player.bladeburner.infiltrateSynthoidCommunities();
      this.finish();
    }
  }
  get nextCompletion(): Promise<void> {
    if (!this.nextCompletionPair.promise)
      this.nextCompletionPair.promise = new Promise((r) => (this.nextCompletionPair.resolve = r));
    return this.nextCompletionPair.promise;
  }
  finish() {
    if (this.nextCompletionPair.resolve) {
      this.nextCompletionPair.resolve();
      this.nextCompletionPair.resolve = null;
      this.nextCompletionPair.promise = null;
    }
  }

  APICopy() {
    return {
      type: SleeveWorkType.INFILTRATE as const,
      cyclesWorked: this.cyclesWorked,
      cyclesNeeded: this.cyclesNeeded(),
      nextCompletion: this.nextCompletion,
    };
  }

  static savedKeys = getKeyList(SleeveInfiltrateWork, { removedKeys: ["nextCompletionPair"] });

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveInfiltrateWork", this, SleeveInfiltrateWork.savedKeys);
  }

  /** Initializes a BladeburnerWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveInfiltrateWork {
    return Generic_fromJSON(SleeveInfiltrateWork, value.data, SleeveInfiltrateWork.savedKeys);
  }
}

constructorsForReviver.SleeveInfiltrateWork = SleeveInfiltrateWork;
