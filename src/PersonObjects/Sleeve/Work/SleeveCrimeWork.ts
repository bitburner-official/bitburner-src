import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { applySleeveGains, SleeveWorkClass, SleeveWorkType } from "./Work";
import { CrimeType } from "@enums";
import { Crimes } from "../../../Crime/Crimes";
import { Crime } from "../../../Crime/Crime";
import { scaleWorkStats, WorkStats } from "../../../Work/WorkStats";
import { CONSTANTS } from "../../../Constants";
import { calculateCrimeWorkStats } from "../../../Work/Formulas";
import { findCrime } from "../../../Crime/CrimeHelpers";

export const isSleeveCrimeWork = (w: SleeveWorkClass | null): w is SleeveCrimeWork =>
  w !== null && w.type === SleeveWorkType.CRIME;

export class SleeveCrimeWork extends SleeveWorkClass {
  type: SleeveWorkType.CRIME = SleeveWorkType.CRIME;
  crimeType: CrimeType;
  tasksCompleted = 0;
  cyclesWorked = 0;
  constructor(crimeType?: CrimeType) {
    super();
    this.crimeType = crimeType ?? CrimeType.shoplift;
  }

  getCrime(): Crime {
    return Crimes[this.crimeType];
  }

  getExp(sleeve: Sleeve): WorkStats {
    return scaleWorkStats(calculateCrimeWorkStats(sleeve, this.getCrime()), sleeve.shockBonus(), false);
  }

  cyclesNeeded(): number {
    return this.getCrime().time / CONSTANTS.MilliPerCycle;
  }

  process(sleeve: Sleeve, cycles: number) {
    this.cyclesWorked += cycles;
    if (this.cyclesWorked < this.cyclesNeeded()) return;

    while (this.cyclesWorked > this.cyclesNeeded()) {
      const crime = this.getCrime();
      const gains = this.getExp(sleeve);
      const success = Math.random() < crime.successRate(sleeve);
      if (success) {
        Player.karma -= crime.karma * sleeve.syncBonus();
        Player.numPeopleKilled += crime.kills;
      } else gains.money = 0;
      applySleeveGains(sleeve, gains, success ? 1 : 0.25);
      this.tasksCompleted++;
      this.cyclesWorked -= this.cyclesNeeded();
    }
  }

  APICopy() {
    return {
      type: SleeveWorkType.CRIME as const,
      crimeType: this.crimeType,
      tasksCompleted: this.tasksCompleted,
      cyclesWorked: this.cyclesWorked,
      cyclesNeeded: this.cyclesNeeded(),
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveCrimeWork", this);
  }

  /** Initializes a RecoveryWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveCrimeWork {
    const crimeWork = Generic_fromJSON(SleeveCrimeWork, value.data);
    crimeWork.crimeType = findCrime(crimeWork.crimeType)?.type ?? CrimeType.shoplift;
    return crimeWork;
  }
}

constructorsForReviver.SleeveCrimeWork = SleeveCrimeWork;
