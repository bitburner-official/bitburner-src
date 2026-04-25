import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { SleeveBaseWork, SleeveWorkType } from "./Work";

export const isSleeveSupportWork = (w: SleeveBaseWork | null): w is SleeveSupportWork =>
  w !== null && w.type === SleeveWorkType.SUPPORT;

export class SleeveSupportWork extends SleeveBaseWork {
  type: SleeveWorkType.SUPPORT = SleeveWorkType.SUPPORT;
  constructor() {
    super();
    Player.bladeburner?.sleeveSupport(true);
  }

  process(): void {}

  finish(): void {
    Player.bladeburner?.sleeveSupport(false);
    super.resolveNextCompletion();
  }

  APICopy() {
    return {
      type: SleeveWorkType.SUPPORT as const,
      nextCompletion: this.nextCompletion,
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveSupportWork", this);
  }

  /** Initializes a BladeburnerWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveSupportWork {
    return Generic_fromJSON(SleeveSupportWork, value.data);
  }
}

constructorsForReviver.SleeveSupportWork = SleeveSupportWork;
