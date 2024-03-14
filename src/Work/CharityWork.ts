import { Player } from "@player";
import { CharityType } from "@enums";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Charity } from "../Charity/Charity";
import { CONSTANTS } from "../Constants";
import { determineCharitySuccess } from "../Charity/CharityHelpers";
import { Charities } from "../Charity/Charities";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Work, WorkType } from "./Work";
import { scaleWorkStats, WorkStats } from "./WorkStats";
import { calculateCharityWorkStats } from "./Formulas";
import { getEnumHelper } from "../utils/EnumHelper";

interface CharityWorkParams {
  charityType: CharityType;
  singularity: boolean;
}

export const isCharityWork = (w: Work | null): w is CharityWork => w !== null && w.type === WorkType.CHARITY;

export class CharityWork extends Work {
  charityType: CharityType;
  unitCompleted: number;

  constructor(params?: CharityWorkParams) {
    super(WorkType.CHARITY, params?.singularity ?? true);
    this.charityType = params?.charityType ?? CharityType.stopRobery;
    this.unitCompleted = 0;
    this.cyclesWorked = 0;
  }

  getCharity(): Charity {
    return Charities[this.charityType];
  }

  process(cycles = 1): boolean {
    this.cyclesWorked += cycles;
    const time = Object.values(Charities).find((c) => c.type === this.charityType)?.time ?? 0;
    this.unitCompleted += CONSTANTS.MilliPerCycle * cycles;
    while (this.unitCompleted >= time) {
      this.commit();
      this.unitCompleted -= time;
    }
    return false;
  }

  earnings(): WorkStats {
    return calculateCharityWorkStats(Player, this.getCharity());
  }

  commit(): void {
    const charity = this.getCharity();
    if (charity == null) {
      dialogBoxCreate(
        `ERR: Unrecognized charity type (${this.charityType}). This is probably a bug please contact the developer`,
      );
      return;
    }
    const focusPenalty = Player.focusPenalty();
    // exp times 2 because were trying to maintain the same numbers as before the conversion
    // Technically the definition of Crimes should have the success numbers and failure should divide by 4
    let gains = scaleWorkStats(this.earnings(), focusPenalty, false);
    let karma = charity.karma;
    const success = determineCharitySuccess(charity.type);
    if (success) {
      Player.gainMoney(gains.money, "charity");
      Player.numPeopleSaved += charity.saves;
      Player.gainIntelligenceExp(gains.intExp);
    } else {
      gains = scaleWorkStats(gains, 0.25);
      karma /= 4;
    }
    Player.gainHackingExp(gains.hackExp);
    Player.gainStrengthExp(gains.strExp);
    Player.gainDefenseExp(gains.defExp);
    Player.gainDexterityExp(gains.dexExp);
    Player.gainAgilityExp(gains.agiExp);
    Player.gainCharismaExp(gains.chaExp);
    Player.karma -= karma * focusPenalty;
  }

  finish(): void {
    /** nothing to do */
  }

  APICopy() {
    return {
      type: WorkType.CHARITY as const,
      cyclesWorked: this.cyclesWorked,
      charityType: this.charityType,
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("CharityWork", this);
  }

  /** Initializes a CrimeWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): CharityWork {
    const charityWork = Generic_fromJSON(CharityWork, value.data);
    charityWork.charityType = getEnumHelper("CharityType").getMember(charityWork.charityType, { alwaysMatch: true });
    return charityWork;
  }
}

constructorsForReviver.CharityWork = CharityWork;
