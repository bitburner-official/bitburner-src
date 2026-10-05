import { makeSerializable } from "../../../utils/GenericReviver";
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

  static includedKeys = makeSerializable("SleeveRecoveryWork", SleeveRecoveryWork);
}
