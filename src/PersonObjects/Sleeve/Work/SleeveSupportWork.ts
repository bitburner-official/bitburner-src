import { Player } from "@player";
import { makeSerializable } from "../../../utils/GenericReviver";
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

  static includedKeys = makeSerializable("SleeveSupportWork", SleeveSupportWork);
}
