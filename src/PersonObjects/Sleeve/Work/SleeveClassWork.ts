import { LocationName } from "../../../Enums";
import { GymType, UniversityClassType } from "../../../Enums";
import { Locations } from "../../../Locations/Locations";
import { ClassType, Classes } from "../../../Work/ClassWork";
import { calculateClassEarnings } from "../../../Work/Formulas";
import { WorkStats, scaleWorkStats } from "../../../Work/WorkStats";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { checkEnum } from "../../../utils/helpers/enum";
import { Sleeve } from "../Sleeve";
import { Work, WorkType, applySleeveGains } from "./Work";

export const isSleeveClassWork = (w: Work | null): w is SleeveClassWork => w !== null && w.type === WorkType.CLASS;

interface ClassWorkParams {
  classType: ClassType;
  location: LocationName;
}

export class SleeveClassWork extends Work {
  type: WorkType.CLASS = WorkType.CLASS;
  classType: ClassType;
  location: LocationName;

  constructor(params?: ClassWorkParams) {
    super();
    this.classType = params?.classType ?? UniversityClassType.computerScience;
    this.location = params?.location ?? LocationName.Sector12RothmanUniversity;
  }

  calculateRates(sleeve: Sleeve): WorkStats {
    return scaleWorkStats(calculateClassEarnings(sleeve, this.classType, this.location), sleeve.shockBonus(), false);
  }

  isGym(): boolean {
    return checkEnum(GymType, this.classType);
  }

  process(sleeve: Sleeve, cycles: number) {
    const rate = this.calculateRates(sleeve);
    applySleeveGains(sleeve, rate, cycles);
  }

  APICopy() {
    return {
      type: WorkType.CLASS as "CLASS",
      classType: this.classType,
      location: this.location,
    };
  }
  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveClassWork", this);
  }

  /** Initializes a ClassWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveClassWork {
    if (!(value.data.classType in Classes)) value.data.classType = "Computer Science";
    if (!(value.data.location in Locations)) value.data.location = LocationName.Sector12RothmanUniversity;
    return Generic_fromJSON(SleeveClassWork, value.data);
  }
}

constructorsForReviver.SleeveClassWork = SleeveClassWork;
