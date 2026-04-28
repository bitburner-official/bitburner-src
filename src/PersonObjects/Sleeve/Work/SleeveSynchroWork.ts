import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { SleeveBaseWork, SleeveWorkType } from "./Work";
import { calculateIntelligenceBonus } from "../../formulas/intelligence";

export const isSleeveSynchroWork = (w: SleeveBaseWork | null): w is SleeveSynchroWork =>
  w !== null && w.type === SleeveWorkType.SYNCHRO;

export class SleeveSynchroWork extends SleeveBaseWork {
  type: SleeveWorkType.SYNCHRO = SleeveWorkType.SYNCHRO;

  process(sleeve: Sleeve, cycles: number) {
    sleeve.sync = Math.min(
      100,
      sleeve.sync + calculateIntelligenceBonus(Player.skills.intelligence, 0.5) * 0.0002 * cycles,
    );
    if (sleeve.sync >= 100) sleeve.stopWork();
  }

  APICopy() {
    return {
      type: SleeveWorkType.SYNCHRO as const,
      nextCompletion: this.nextCompletion,
    };
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
