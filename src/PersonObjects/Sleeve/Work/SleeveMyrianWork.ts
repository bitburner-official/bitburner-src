import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { SleeveWork, SleeveWorkClass, SleeveWorkType } from "./Work";

export const isSleeveMyrianWork = (w: SleeveWork | null): w is SleeveMyrianWork =>
  w !== null && w.type === SleeveWorkType.MYRIAN;

export class SleeveMyrianWork extends SleeveWorkClass {
  type: SleeveWorkType.MYRIAN = SleeveWorkType.MYRIAN;

  process(sleeve: Sleeve, cycles: number) {}

  APICopy() {
    return { type: SleeveWorkType.MYRIAN as "MYRIAN" };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveRecoveryWork", this);
  }

  /** Initializes a RecoveryWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveMyrianWork {
    return Generic_fromJSON(SleeveMyrianWork, value.data);
  }
}

constructorsForReviver.SleeveMyrianWork = SleeveMyrianWork;
