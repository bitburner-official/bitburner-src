import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { applySleeveGains, SleeveWorkClass, SleeveWorkType } from "./Work";
import { CharityType } from "@enums";
import { Charities } from "../../../Charity/Charities";
import { Charity } from "../../../Charity/Charity";
import { scaleWorkStats, WorkStats } from "../../../Work/WorkStats";
import { CONSTANTS } from "../../../Constants";
import { calculateCharityWorkStats } from "../../../Work/Formulas";
import { findCharity } from "../../../Charity/CharityHelpers";

export const isSleeveCharityWork = (w: SleeveWorkClass | null): w is SleeveCharityWork =>
  w !== null && w.type === SleeveWorkType.CHARITY;

export class SleeveCharityWork extends SleeveWorkClass {
  type: SleeveWorkType.CHARITY = SleeveWorkType.CHARITY;
  charityType: CharityType;
  cyclesWorked = 0;
  constructor(charityType?: CharityType) {
    super();
    this.charityType = charityType ?? CharityType.stopRobery;
  }

  getCharity(): Charity {
    return Charities[this.charityType];
  }

  getExp(sleeve: Sleeve): WorkStats {
    return scaleWorkStats(calculateCharityWorkStats(sleeve, this.getCharity()), sleeve.shockBonus(), false);
  }

  cyclesNeeded(): number {
    return this.getCharity().time / CONSTANTS.MilliPerCycle;
  }

  process(sleeve: Sleeve, cycles: number) {
    this.cyclesWorked += cycles;
    if (this.cyclesWorked < this.cyclesNeeded()) return;

    while (this.cyclesWorked > this.cyclesNeeded()) {
      const charity = this.getCharity();
      const gains = this.getExp(sleeve);
      const success = Math.random() < charity.successRate(sleeve);
      if (success) {
        Player.karma -= charity.karma * sleeve.syncBonus();
        Player.numPeopleSaved += charity.saves;
      } else gains.money = 0;
      applySleeveGains(sleeve, gains, success ? 1 : 0.25);
      this.cyclesWorked -= this.cyclesNeeded();
    }
  }

  APICopy() {
    return {
      type: SleeveWorkType.CHARITY as "CHARITY",
      charityType: this.charityType,
      cyclesWorked: this.cyclesWorked,
      cyclesNeeded: this.cyclesNeeded(),
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveCharityWork", this);
  }

  /** Initializes a RecoveryWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveCharityWork {
    const charityWork = Generic_fromJSON(SleeveCharityWork, value.data);
    charityWork.charityType = findCharity(charityWork.charityType)?.type ?? CharityType.stopRobery;
    return charityWork;
  }
}

constructorsForReviver.SleeveCharityWork = SleeveCharityWork;
