import type { BladeMultName, BladeSkillName } from "@enums";

import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Bladeburner } from "./Bladeburner";
import { Availability } from "./Types";
import { PositiveSafeInteger, isPositiveSafeInteger } from "../types";
import { PartialRecord, getRecordEntries } from "../Types/Record";

interface SkillParams {
  name: BladeSkillName;
  desc: string;
  baseCost?: number;
  costInc?: number;
  maxLvl?: number;
  mults: PartialRecord<BladeMultName, number>;
}

export class Skill {
  name: BladeSkillName;
  desc: string;
  // Cost is in Skill Points
  baseCost = 1;
  // Additive cost increase per level
  costInc = 1;
  maxLvl = Number.MAX_SAFE_INTEGER;
  mults: PartialRecord<BladeMultName, number> = {};

  constructor(params: SkillParams) {
    this.name = params.name;
    this.desc = params.desc;
    this.baseCost = params.baseCost ?? 1;
    this.costInc = params.costInc ?? 1;
    this.maxLvl = params.maxLvl ?? 1;
    for (const [multName, mult] of getRecordEntries(params.mults)) this.mults[multName] = mult;
  }

  calculateCost(currentLevel: number, count = 1 as PositiveSafeInteger): number {
    if (currentLevel + count > this.maxLvl) return Infinity;
    //Recursive mode does not handle invalid inputs properly, but it should never
    //be possible for it to run with them. For the sake of not crashing the game,
    const recursiveMode = (currentLevel: number, count: PositiveSafeInteger): number => {
      if (count <= 1) {
        return Math.floor((this.baseCost + currentLevel * this.costInc) * currentNodeMults.BladeburnerSkillCost);
      } else {
        const thisUpgrade = Math.floor(
          (this.baseCost + currentLevel * this.costInc) * currentNodeMults.BladeburnerSkillCost,
        );
        return this.calculateCost(currentLevel + 1, (count - 1) as PositiveSafeInteger) + thisUpgrade;
      }
    };

    //Count must be a positive integer.
    if (count < 0 || count % 1 != 0) {
      throw new Error(`${count} is an invalid number of upgrades`);
    }
    //Use recursive mode if count is small
    if (count <= 100) {
      return recursiveMode(currentLevel, count);
    }
    //Use optimized mode if count is large
    else {
      //unFloored is roughly equivalent to
      //(this.baseCost + currentLevel * this.costInc) * BitNodeMultipliers.BladeburnerSkillCost
      //being repeated for increasing currentLevel
      const preMult = (count * (2 * this.baseCost + this.costInc * (2 * currentLevel + count + 1))) / 2;
      const unFloored = preMult * currentNodeMults.BladeburnerSkillCost - count / 2;
      return Math.floor(unFloored);
    }
  }

  canUpgrade(bladeburner: Bladeburner, count = 1): Availability<{ cost: number }> {
    const currentLevel = bladeburner.skills[this.name] ?? 0;
    if (!isPositiveSafeInteger(count)) return { error: `Invalid upgrade count ${count}` };
    if (currentLevel + count > this.maxLvl) return { error: `Upgraded level ${currentLevel + count} exceeds max` };
    const cost = this.calculateCost(currentLevel, count);
    if (cost > bladeburner.skillPoints) return { error: `Insufficient skill points for upgrade` };
    return { available: true, cost };
  }

  getMultiplier(name: BladeMultName): number {
    return this.mults[name] ?? 0;
  }
}
