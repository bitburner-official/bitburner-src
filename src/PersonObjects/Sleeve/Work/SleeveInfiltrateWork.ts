import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, Reviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { Work, WorkType } from "./Work";
import { CONSTANTS } from "../../../Constants";

const infiltrateCycles = 60000 / CONSTANTS.MilliPerCycle;

export const isSleeveInfiltrateWork = (w: Work | null): w is SleeveInfiltrateWork =>
  w !== null && w.type === WorkType.INFILTRATE;

export class SleeveInfiltrateWork extends Work {
  type: WorkType.INFILTRATE = WorkType.INFILTRATE;
  cyclesWorked = 0;

  cyclesNeeded(): number {
    return infiltrateCycles;
  }

  process(sleeve: Sleeve, cycles: number) {
    if (!Player.bladeburner) return sleeve.stopWork();
    this.cyclesWorked += cycles;
    if (this.cyclesWorked > this.cyclesNeeded()) {
      this.cyclesWorked -= this.cyclesNeeded();
      Player.bladeburner.infiltrateSynthoidCommunities();
    }
  }

  APICopy() {
    return {
      type: WorkType.INFILTRATE as "INFILTRATE",
      cyclesWorked: this.cyclesWorked,
      cyclesNeeded: this.cyclesNeeded(),
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveInfiltrateWork", this);
  }

  /** Initializes a BladeburnerWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveInfiltrateWork {
    return Generic_fromJSON(SleeveInfiltrateWork, value.data);
  }
}

Reviver.constructors.SleeveInfiltrateWork = SleeveInfiltrateWork;
