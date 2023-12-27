import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { SleeveWorkClass, SleeveWorkType } from "./Work";
import { CONSTANTS } from "../../../Constants";

const infiltrateCycles = 60000 / CONSTANTS.MilliPerCycle;

export const isSleeveInfiltrateWork = (w: SleeveWorkClass | null): w is SleeveInfiltrateWork =>
  w !== null && w.type === SleeveWorkType.INFILTRATE;

export class SleeveInfiltrateWork extends SleeveWorkClass {
  type: SleeveWorkType.INFILTRATE = SleeveWorkType.INFILTRATE;
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
      type: SleeveWorkType.INFILTRATE as const,
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

constructorsForReviver.SleeveInfiltrateWork = SleeveInfiltrateWork;
