import type { BladeMultName, BladeSkillName } from "@enums";

import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Bladeburner } from "./Bladeburner";
import { Availability } from "./Types";
import { PositiveInteger, isPositiveInteger } from "../types";
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
    return Math.floor(
      count * this.baseCost * currentNodeMults.BladeburnerSkillCost +
        this.costInc * currentNodeMults.BladeburnerSkillCost * (count * currentLevel + (count * (count - 1)) / 2),
    );
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
