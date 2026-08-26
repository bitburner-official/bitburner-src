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
import { PlayerBaseWork, WorkType } from "./Work";
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
    youAreCurrently: `学习计算机科学`,
    earnings: newWorkStats({ hackExp: 0.5, intExp: 0.01 }),
  },
  [UniversityClassType.dataStructures]: {
    type: UniversityClassType.dataStructures,
    youAreCurrently: "上数据结构课程",
    earnings: newWorkStats({ money: -40, hackExp: 1, intExp: 0.01 }),
  },
  [UniversityClassType.networks]: {
    type: UniversityClassType.networks,
    youAreCurrently: "上网络课程",
    earnings: newWorkStats({ money: -80, hackExp: 2, intExp: 0.01 }),
  },
  [UniversityClassType.algorithms]: {
    type: UniversityClassType.algorithms,
    youAreCurrently: "上算法课程",
    earnings: newWorkStats({ money: -320, hackExp: 4, intExp: 0.01 }),
  },
  [UniversityClassType.management]: {
    type: UniversityClassType.management,
    youAreCurrently: "上管理课程",
    earnings: newWorkStats({ money: -160, chaExp: 2, intExp: 0.01 }),
  },
  [UniversityClassType.leadership]: {
    type: UniversityClassType.leadership,
    youAreCurrently: "上领导力课程",
    earnings: newWorkStats({ money: -320, chaExp: 4, intExp: 0.01 }),
  },
  [GymType.strength]: {
    type: GymType.strength,
    youAreCurrently: "在健身房训练力量",
    earnings: newWorkStats({ money: -120, strExp: 1 }),
  },
  [GymType.defense]: {
    type: GymType.defense,
    youAreCurrently: "在健身房训练防御",
    earnings: newWorkStats({ money: -120, defExp: 1 }),
  },
  [GymType.dexterity]: {
    type: GymType.dexterity,
    youAreCurrently: "在健身房训练灵巧",
    earnings: newWorkStats({ money: -120, dexExp: 1 }),
  },
  [GymType.agility]: {
    type: GymType.agility,
    youAreCurrently: "在健身房训练敏捷",
    earnings: newWorkStats({ money: -120, agiExp: 1 }),
  },
};

interface ClassWorkParams {
  classType: ClassType;
  location: LocationName;
  singularity: boolean;
}

export const isClassWork = (w: PlayerBaseWork | null): w is ClassWork => w !== null && w.type === WorkType.CLASS;
export class ClassWork extends PlayerBaseWork {
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

  finish(__cancelled: boolean, suppressDialog?: boolean): void {
    if (!this.singularity && !suppressDialog) {
      dialogBoxCreate(
        <>
          {this.getClass().youAreCurrently}{" "}
          {convertTimeMsToTimeElapsedString(this.cyclesWorked * CONSTANTS.MilliPerCycle)}后，<br />
          你总共花费了 <Money money={-this.earnings.money} />。<br />
          <br />
          你总共获得了：<br />
          {formatExp(this.earnings.hackExp)} 黑客经验 <br />
          {formatExp(this.earnings.strExp)} 力量经验 <br />
          {formatExp(this.earnings.defExp)} 防御经验 <br />
          {formatExp(this.earnings.dexExp)} 灵巧经验 <br />
          {formatExp(this.earnings.agiExp)} 敏捷经验 <br />
          {formatExp(this.earnings.chaExp)} 魅力经验
          <br />
        </>,
      );
    }
    this.resolveNextCompletion();
  }

  APICopy() {
    return {
      type: WorkType.CLASS as const,
      cyclesWorked: this.cyclesWorked,
      classType: this.classType,
      location: this.location,
      nextCompletion: this.nextCompletion,
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
