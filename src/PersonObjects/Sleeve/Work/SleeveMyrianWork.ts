import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { Work, WorkType } from "./Work";
import { calculateIntelligenceBonus } from "../../formulas/intelligence";

export const isSleeveMyrianWork = (w: Work | null): w is SleeveMyrianWork =>
    w !== null && w.type === WorkType.MYRIAN;

export class SleeveMyrianWork extends Work {
    type: WorkType.MYRIAN = WorkType.MYRIAN;

    process(sleeve: Sleeve, cycles: number) { }

    APICopy() {
        return { type: WorkType.MYRIAN as "MYRIAN" };
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
