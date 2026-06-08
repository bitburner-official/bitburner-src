import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { SleeveBaseWork, SleeveWorkType } from "./Work";
import { calculateIntelligenceBonus } from "../../formulas/intelligence";

export const isSleeveRecoveryWork = (w: SleeveBaseWork | null): w is SleeveRecoveryWork =>
  w !== null && w.type === SleeveWorkType.RECOVERY;

export class SleeveRecoveryWork extends SleeveBaseWork {
  type: SleeveWorkType.RECOVERY = SleeveWorkType.RECOVERY;

  process(sleeve: Sleeve, cycles: number) {
    sleeve.shock = Math.max(
      0,
      sleeve.shock - 0.0002 * calculateIntelligenceBonus(sleeve.skills.intelligence, 0.75) * cycles,
    );
    if (sleeve.shock <= 0) sleeve.stopWork();
  }

  APICopy() {
    return {
      type: SleeveWorkType.RECOVERY as const,
      nextCompletion: this.nextCompletion,
    };
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
