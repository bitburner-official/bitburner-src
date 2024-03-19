import type { Bladeburner } from "../Bladeburner";
import type { Contract } from "./Contract";
import type { Operation } from "./Operation";
import type { Unknownify } from "../../types";
import type { IReviverValue } from "../../utils/JSONReviver";

import { BladeActionType } from "@enums";
import { Action, ActionAvailability, ActionClass, ActionParams } from "./Action";
import { getRandomInt } from "../../utils/helpers/getRandomInt";

export type LevelableAction = Contract | Operation;

export function isLevelableAction(action: Action): action is LevelableAction {
  return action.type === BladeActionType.contract || action.type === BladeActionType.operation;
}

export type LevelableActionParams = ActionParams & {
  growthFunction: () => number;
  difficultyFac?: number;
  rewardFac?: number;
  minCount?: number;
  maxCount?: number;
};

export abstract class LevelableActionClass extends ActionClass {
  // Static info, not included in save
  difficultyFac = 1.01;
  rewardFac = 1.02;
  growthFunction = () => 0;
  minCount = 1;
  maxCount = 150;

  // Dynamic properties included in save
  count = 0;
  level = 1;
  maxLevel = 1;
  autoLevel = true;
  successes = 0;
  failures = 0;

  constructor(params: LevelableActionParams | null = null) {
    super(params);
    if (!params) return;
    if (params.minCount) this.minCount = params.minCount;
    if (params.maxCount) this.maxCount = params.maxCount;
    if (params.difficultyFac) this.difficultyFac = params.difficultyFac;
    if (params.rewardFac) this.rewardFac = params.rewardFac;
    this.count = getRandomInt(this.minCount, this.maxCount);
    this.growthFunction = params.growthFunction;
  }

  getAvailability(__bladeburner: Bladeburner): ActionAvailability {
    if (this.count < 1) return { error: "Insufficient action count" };
    return { available: true };
  }

  setMaxLevel(baseSuccessesPerLevel: number): void {
    if (this.successes >= this.getSuccessesNeededForNextLevel(baseSuccessesPerLevel)) {
      ++this.maxLevel;
    }
  }
  getSuccessesNeededForNextLevel(baseSuccessesPerLevel: number): number {
    return Math.ceil(0.5 * this.maxLevel * (2 * baseSuccessesPerLevel + (this.maxLevel - 1)));
  }

  getDifficulty() {
    const difficulty = this.baseDifficulty * Math.pow(this.difficultyFac, this.level - 1);
    if (isNaN(difficulty)) {
      throw new Error("Calculated NaN in Action.getDifficulty()");
    }
    return difficulty;
  }

  /** Reset a levelable action's tracked stats */
  reset() {
    this.count = getRandomInt(this.minCount, this.maxCount);
    this.level = 1;
    this.maxLevel = 1;
    this.autoLevel = true;
    this.successes = 0;
    this.failures = 0;
  }

  /** Uses savegame data to load info onto the static objects for a levelable action */
  static load<T extends LevelableActionClass>(baseObject: T, data: Unknownify<LevelableActionSaveData>): T {
    if (!data || typeof data !== "object") return baseObject;
    // Rudimentary typechecking
    if (typeof data.count === "number") baseObject.count = data.count;
    if (typeof data.level === "number") baseObject.level = data.level;
    if (typeof data.maxLevel === "number") baseObject.maxLevel = data.maxLevel;
    baseObject.autoLevel = !!data.autoLevel;
    if (typeof data.successes === "number") baseObject.successes = data.successes;
    if (typeof data.failures === "number") baseObject.failures = data.failures;
    return baseObject;
  }
  /** Create a basic object just containing the relevant data for a levelable action */
  save<T extends LevelableAction>(this: T, ctorName: string, ...extraParams: (keyof T)[]): IReviverValue {
    // Would like to get rid of this any, but not sure what typing will allow doing this
    const data: any = {
      count: this.count,
      level: this.level,
      maxLevel: this.maxLevel,
      autoLevel: this.autoLevel,
      successes: this.successes,
      failures: this.failures,
    };
    for (const param of extraParams) {
      data[param] = this[param];
    }
    return { ctor: ctorName, data };
  }
}

export type LevelableActionSaveData = {
  count: number;
  level: number;
  maxLevel: number;
  autoLevel: boolean;
  successes: number;
  failures: number;
};
