import type { BladeMultName, BladeSkillName } from "@enums";

import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Bladeburner } from "./Bladeburner";
import { Availability } from "./Types";
import { PositiveInteger, PositiveSafeInteger, isPositiveInteger } from "../types";
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
  baseCost: number;
  // Additive cost increase per level
  costInc: number;
  maxLvl: number;
  mults: PartialRecord<BladeMultName, number> = {};

  constructor(params: SkillParams) {
    this.name = params.name;
    this.desc = params.desc;
    this.baseCost = params.baseCost ?? 1;
    this.costInc = params.costInc ?? 1;
    this.maxLvl = params.maxLvl ?? Number.MAX_SAFE_INTEGER;
    for (const [multName, mult] of getRecordEntries(params.mults)) this.mults[multName] = mult;
  }

  calculateCost(currentLevel: number, count = 1 as PositiveInteger): number {
    if (currentLevel + count > this.maxLvl) return Infinity;

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

    // Use recursive mode if count is small
    if (count <= 100) return recursiveMode(currentLevel, count as PositiveSafeInteger);
    // Use optimized mode if count is large
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
    if (!isPositiveInteger(count)) return { error: `Invalid upgrade count ${count}` };
    if (currentLevel + count > this.maxLvl) return { error: `Upgraded level ${currentLevel + count} exceeds max` };
    const cost = this.calculateCost(currentLevel, count);
    if (cost > bladeburner.skillPoints) return { error: `Insufficient skill points for upgrade` };
    return { available: true, cost };
  }

  getMultiplier(name: BladeMultName): number {
    return this.mults[name] ?? 0;
  }
}
