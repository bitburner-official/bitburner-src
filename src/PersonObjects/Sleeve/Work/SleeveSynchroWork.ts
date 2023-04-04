import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { Work, WorkType } from "./Work";
import { calculateIntelligenceBonus } from "../../formulas/intelligence";

export const isSleeveSynchroWork = (w: Work | null): w is SleeveSynchroWork =>
  w !== null && w.type === WorkType.SYNCHRO;

export class SleeveSynchroWork extends Work {
  type: WorkType.SYNCHRO = WorkType.SYNCHRO;

  process(sleeve: Sleeve, cycles: number) {
    sleeve.sync = Math.min(
      100,
      sleeve.sync + calculateIntelligenceBonus(Player.skills.intelligence, 0.5) * 0.0002 * cycles,
    );
    if (sleeve.sync >= 100) sleeve.stopWork();
  }

  APICopy() {
    return { type: WorkType.SYNCHRO as "SYNCHRO" };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveSynchroWork", this);
  }

  /** Initializes a SynchroWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveSynchroWork {
    return Generic_fromJSON(SleeveSynchroWork, value.data);
  }
}

constructorsForReviver.SleeveSynchroWork = SleeveSynchroWork;
