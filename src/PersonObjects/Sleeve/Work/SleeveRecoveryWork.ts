import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { calculateIntelligenceBonus } from "../../formulas/intelligence";
import { Sleeve } from "../Sleeve";
import { Work, WorkType } from "./Work";

export const isSleeveRecoveryWork = (w: Work | null): w is SleeveRecoveryWork =>
  w !== null && w.type === WorkType.RECOVERY;

export class SleeveRecoveryWork extends Work {
  type: WorkType.RECOVERY = WorkType.RECOVERY;

  process(sleeve: Sleeve, cycles: number) {
    sleeve.shock = Math.max(
      0,
      sleeve.shock - 0.0002 * calculateIntelligenceBonus(sleeve.skills.intelligence, 0.75) * cycles,
    );
    if (sleeve.shock <= 0) sleeve.stopWork();
  }

  APICopy() {
    return { type: WorkType.RECOVERY as "RECOVERY" };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveRecoveryWork", this);
  }

  /** Initializes a RecoveryWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveRecoveryWork {
    return Generic_fromJSON(SleeveRecoveryWork, value.data);
  }
}

constructorsForReviver.SleeveRecoveryWork = SleeveRecoveryWork;
