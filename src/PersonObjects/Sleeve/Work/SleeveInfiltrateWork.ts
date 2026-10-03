import { Player } from "@player";
import { makeSerializable } from "../../../utils/GenericReviver";
import { Sleeve } from "../Sleeve";
import { SleeveBaseWork, SleeveWorkType } from "./Work";
import { CONSTANTS } from "../../../Constants";

const infiltrateCycles = 60000 / CONSTANTS.MilliPerCycle;

export const isSleeveInfiltrateWork = (w: SleeveBaseWork | null): w is SleeveInfiltrateWork =>
  w !== null && w.type === SleeveWorkType.INFILTRATE;

export class SleeveInfiltrateWork extends SleeveBaseWork {
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
      this.resolveNextCompletion();
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

  static includedKeys = makeSerializable("SleeveInfiltrateWork", SleeveInfiltrateWork);
}
