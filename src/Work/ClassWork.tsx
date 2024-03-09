import React from "react";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { CONSTANTS } from "../Constants";
import { formatExp } from "../ui/formatNumber";
import { ClassType, GymType, LocationName, UniversityClassType } from "@enums";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Money } from "../ui/React/Money";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";
import { Player } from "@player";
import { calculateClassEarnings as calculateClassEarningsRate } from "./Formulas";
import { Work, WorkType } from "./Work";
import { applyWorkStats, newWorkStats, sumWorkStats, WorkStats } from "./WorkStats";
import { findEnumMember } from "../utils/helpers/enum";
import { isMember } from "../utils/EnumHelper";

export interface Class {
  type: ClassType;
  youAreCurrently: string;
  earnings: WorkStats;
}

export const Classes: Record<ClassType, Class> = {
  [UniversityClassType.computerScience]: {
    type: UniversityClassType.computerScience,
    youAreCurrently: `studying Computer Science`,
    earnings: newWorkStats({ hackExp: 0.5, intExp: 0.01 }),
  },
  [UniversityClassType.dataStructures]: {
    type: UniversityClassType.dataStructures,
    youAreCurrently: "taking a Data Structures course",
    earnings: newWorkStats({ money: -40, hackExp: 1, intExp: 0.01 }),
  },
  [UniversityClassType.networks]: {
    type: UniversityClassType.networks,
    youAreCurrently: "taking a Networks course",
    earnings: newWorkStats({ money: -80, hackExp: 2, intExp: 0.01 }),
  },
  [UniversityClassType.algorithms]: {
    type: UniversityClassType.algorithms,
    youAreCurrently: "taking an Algorithms course",
    earnings: newWorkStats({ money: -320, hackExp: 4, intExp: 0.01 }),
  },
  [UniversityClassType.management]: {
    type: UniversityClassType.management,
    youAreCurrently: "taking a Management course",
    earnings: newWorkStats({ money: -160, chaExp: 2, intExp: 0.01 }),
  },
  [UniversityClassType.leadership]: {
    type: UniversityClassType.leadership,
    youAreCurrently: "taking a Leadership course",
    earnings: newWorkStats({ money: -320, chaExp: 4, intExp: 0.01 }),
  },
  [GymType.strength]: {
    type: GymType.strength,
    youAreCurrently: "training your strength at a gym",
    earnings: newWorkStats({ money: -120, strExp: 1 }),
  },
  [GymType.defense]: {
    type: GymType.defense,
    youAreCurrently: "training your defense at a gym",
    earnings: newWorkStats({ money: -120, defExp: 1 }),
  },
  [GymType.dexterity]: {
    type: GymType.dexterity,
    youAreCurrently: "training your dexterity at a gym",
    earnings: newWorkStats({ money: -120, dexExp: 1 }),
  },
  [GymType.agility]: {
    type: GymType.agility,
    youAreCurrently: "training your agility at a gym",
    earnings: newWorkStats({ money: -120, agiExp: 1 }),
  },
};

interface ClassWorkParams {
  classType: ClassType;
  location: LocationName;
  singularity: boolean;
}

export const isClassWork = (w: Work | null): w is ClassWork => w !== null && w.type === WorkType.CLASS;
export class ClassWork extends Work {
  classType: ClassType;
  location: LocationName;
  earnings = newWorkStats();

  constructor(params?: ClassWorkParams) {
    super(WorkType.CLASS, params?.singularity ?? true);
    this.classType = params?.classType ?? UniversityClassType.computerScience;
    this.location = params?.location ?? LocationName.Sector12RothmanUniversity;
  }

  isGym(): boolean {
    return isMember("GymType", this.classType);
  }

  getClass(): Class {
    return Classes[this.classType];
  }

  calculateRates(): WorkStats {
    return calculateClassEarningsRate(Player, this.classType, this.location);
  }

  process(cycles: number): boolean {
    this.cyclesWorked += cycles;
    const rate = this.calculateRates();
    const earnings = applyWorkStats(Player, rate, cycles, "class");
    this.earnings = sumWorkStats(this.earnings, earnings);
    return false;
  }

  finish(cancelled: boolean, suppressDialog?: boolean): void {
    if (!this.singularity && !suppressDialog) {
      dialogBoxCreate(
        <>
          After {this.getClass().youAreCurrently} for{" "}
          {convertTimeMsToTimeElapsedString(this.cyclesWorked * CONSTANTS.MilliPerCycle)}, <br />
          you spent a total of <Money money={-this.earnings.money} />. <br />
          <br />
          You earned a total of: <br />
          {formatExp(this.earnings.hackExp)} hacking exp <br />
          {formatExp(this.earnings.strExp)} strength exp <br />
          {formatExp(this.earnings.defExp)} defense exp <br />
          {formatExp(this.earnings.dexExp)} dexterity exp <br />
          {formatExp(this.earnings.agiExp)} agility exp <br />
          {formatExp(this.earnings.chaExp)} charisma exp
          <br />
        </>,
      );
    }
  }

  APICopy() {
    return {
      type: WorkType.CLASS as const,
      cyclesWorked: this.cyclesWorked,
      classType: this.classType,
      location: this.location,
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("ClassWork", this);
  }

  /** Initializes a ClassWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): ClassWork {
    const classWork = Generic_fromJSON(ClassWork, value.data);
    classWork.classType =
      findEnumMember(UniversityClassType, classWork.classType) ??
      findEnumMember(GymType, classWork.classType) ??
      UniversityClassType.computerScience;
    return classWork;
  }
}

constructorsForReviver.ClassWork = ClassWork;
