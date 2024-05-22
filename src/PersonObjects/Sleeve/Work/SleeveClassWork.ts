import { ClassType, LocationName, UniversityClassType } from "@enums";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { applySleeveGains, SleeveWorkClass, SleeveWorkType } from "./Work";
import { Classes } from "../../../Work/ClassWork";
import { calculateClassEarnings } from "../../../Work/Formulas";
import { Sleeve } from "../Sleeve";
import { scaleWorkStats, WorkStats } from "../../../Work/WorkStats";
import { Locations } from "../../../Locations/Locations";
import { isMember } from "../../../utils/EnumHelper";

export const isSleeveClassWork = (w: SleeveWorkClass | null): w is SleeveClassWork =>
  w !== null && w.type === SleeveWorkType.CLASS;

interface ClassWorkParams {
  classType: ClassType;
  location: LocationName;
}

export class SleeveClassWork extends SleeveWorkClass {
  type: SleeveWorkType.CLASS = SleeveWorkType.CLASS;
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
    return isMember("GymType", this.classType);
  }

  process(sleeve: Sleeve, cycles: number) {
    const rate = this.calculateRates(sleeve);
    applySleeveGains(sleeve, rate, cycles);
  }

  APICopy() {
    return {
      type: SleeveWorkType.CLASS as const,
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
