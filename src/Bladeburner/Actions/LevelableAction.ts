import type { Bladeburner } from "../Bladeburner";
import type { IReviverValue } from "../../utils/JSONReviver";
import type { Availability } from "../Types";

import { ActionClass, ActionParams } from "./Action";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { clampInteger } from "../../utils/helpers/clampNumber";

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
    this.count = getRandomIntInclusive(this.minCount, this.maxCount);
    this.growthFunction = params.growthFunction;
  }

  getAvailability(__bladeburner: Bladeburner): Availability {
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
    this.count = getRandomIntInclusive(this.minCount, this.maxCount);
    this.level = 1;
    this.maxLevel = 1;
    this.autoLevel = true;
    this.successes = 0;
    this.failures = 0;
  }

  /** These are not loaded the same way as most game objects, to allow better typechecking on load + partially static loading */
  loadData(loadedObject: LevelableActionClass) {
    this.maxLevel = clampInteger(loadedObject.maxLevel, 1);
    this.level = clampInteger(loadedObject.level, 1, this.maxLevel);
    this.count = clampInteger(loadedObject.count, 0);
    this.autoLevel = !!loadedObject.autoLevel;
    this.successes = clampInteger(loadedObject.successes, 0);
    this.failures = clampInteger(loadedObject.failures, 0);
  }
  /** Create a basic object just containing the relevant data for a levelable action */
  save<T extends LevelableActionClass>(
    this: T,
    ctorName: string,
    ...extraParams: (keyof T)[]
  ): IReviverValue<LevelableActionSaveData> {
    const data = {
      ...Object.fromEntries(extraParams.map((param) => [param, this[param]])),
      count: this.count,
      level: this.level,
      maxLevel: this.maxLevel,
      autoLevel: this.autoLevel,
      successes: this.successes,
      failures: this.failures,
    };
    return { ctor: ctorName, data };
  }
}

export interface LevelableActionSaveData {
  count: number;
  level: number;
  maxLevel: number;
  autoLevel: boolean;
  successes: number;
  failures: number;
}
