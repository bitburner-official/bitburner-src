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
    this.maxLvl = params.maxLvl ?? Number.MAX_VALUE;
    for (const [multName, mult] of getRecordEntries(params.mults)) this.mults[multName] = mult;
  }

  calculateCost(currentLevel: number, count = 1 as PositiveInteger): number {
    const actualCount = currentLevel + count - currentLevel;
    /**
     * The cost of the next level: (baseCost + currentLevel * costInc) * mult. The cost needs to be an integer, so we
     * need to use Math.floor or Math.round.
     *
     * Note: there is no notation for Math.round, so I use \lceil and \rceil as alternatives for non-existent \lround
     * and \rround. When you see \lceil and \rceil, it means Math.round, not Math.ceil.
     *
     * In order to calculate the cost of "count" levels, we need to run a loop. "count" can be a big number, so it's
     * infeasible to calculate the cost in that way. We need to find the closed forms of:
     *
     * [1]:
     * $$Cost = \sum_{i = CurrentLevel}^{CurrentLevel+Count-1}\lfloor ((BaseCost + i \ast CostInc) \ast Mult) \rfloor$$
     *
     * Or:
     *
     * [2]:
     * $$Cost = \sum_{i = CurrentLevel}^{CurrentLevel+Count-1}\lceil ((BaseCost + i \ast CostInc) \ast Mult) \rceil$$
     *
     * It's really hard to find the closed forms of those two equations, so we switch to these equations:
     *
     * [3]:
     * $$Cost = \lfloor\sum_{i = CurrentLevel}^{CurrentLevel+Count-1} ((BaseCost + i \ast CostInc) \ast Mult) \rfloor$$
     *
     * Or
     *
     * [4]:
     * $$Cost = \lceil\sum_{i = CurrentLevel}^{CurrentLevel+Count-1} ((BaseCost + i \ast CostInc) \ast Mult) \rceil$$
     *
     * This means that we do the flooring/rounding at the end instead of each iterative step.
     *
     * [3] and [4] are not equivalent to [1] and [2] respectively, but it's much easier to find the close forms of [3]
     * and [4] than [1] and [2]. After testing, we conclude that the cost calculated by [4] is a good approximation of
     * [2], so we choose [4] to calculate the cost. In order to calculate the cost with a big "count", we accept the
     * slight inaccuracy.
     *
     * The closed form of [4]:
     *
     * $$Cost = \lceil Count \ast Mult \ast (BaseCost + (CostInc \ast (CurrentLevel + \frac{Count - 1}{2}))) \rceil$$
     *
     */
    return Math.round(
      actualCount *
        currentNodeMults.BladeburnerSkillCost *
        (this.baseCost + this.costInc * (currentLevel + (actualCount - 1) / 2)),
    );
  }

  calculateMaxUpgradeCount(currentLevel: number, cost: PositiveInteger): number {
    /**
     * Note: there is no notation for Math.round, so I use \lceil and \rceil as alternatives for non-existent \lround
     * and \rround. When you see \lceil and \rceil, it means Math.round, not Math.ceil.
     *
     * Define:
     * - x = count
     * - a = currentNodeMults.BladeburnerSkillCost
     * - b = this.baseCost
     * - c = this.costInc
     * - d = currentLevel
     * - y = cost
     *
     * We have:
     *
     * $$ y = \lceil x \ast a \ast (b + c \ast (d + \frac{x - 1}{2})) \rceil$$
     *
     * To simplify the calculation, let's ignore the Math.round part:
     *
     * $$ y = x \ast a \ast (b + c \ast (d + \frac{x - 1}{2}))$$
     *
     * Solve for x in terms of y:
     *
     * Define:
     *
     * $$ e = -2 \ast b - 2 \ast c \ast d + c $$
     *
     * $$ Delta = \sqrt{a \ast (a \ast {e ^ 2} + 8 \ast c \ast y)} $$
     *
     * Solutions:
     *
     * $$ x_1 = \frac{a \ast e + Delta}{2 \ast a \ast c} $$
     *
     * $$ x_2 = \frac{a \ast e - Delta}{2 \ast a \ast c} $$
     *
     * $a$, $c$ and $y$ are always greater than 0, so $x_2$ is always less than 0. Therefore, $x_1$ is the only
     * solution.
     */
    const e = -2 * this.baseCost - 2 * this.costInc * currentLevel + this.costInc;
    const delta = Math.sqrt(
      currentNodeMults.BladeburnerSkillCost *
        (currentNodeMults.BladeburnerSkillCost * Math.pow(e, 2) + 8 * this.costInc * cost),
    );
    // We ignore Math.round in the previous part, so x2 is just an estimation. In order to not "overestimate" the final
    // result, we use Math.floor here, then "adjust" it later if necessary.
    const result = Math.floor(
      (currentNodeMults.BladeburnerSkillCost * e + delta) / (2 * currentNodeMults.BladeburnerSkillCost * this.costInc),
    );
    // Check if we can afford 1 more upgrade count.
    const costOfResultPlus1 = this.calculateCost(currentLevel, (result + 1) as PositiveInteger);
    if (costOfResultPlus1 <= cost) {
      return result + 1;
    }
    return result;
  }

  canUpgrade(bladeburner: Bladeburner, count = 1): Availability<{ cost: number }> {
    const currentLevel = bladeburner.skills[this.name] ?? 0;
    if (!isPositiveInteger(count)) {
      return { error: `Invalid upgrade count ${count}` };
    }
    if (currentLevel + count > this.maxLvl) {
      return { error: `Upgraded level ${currentLevel + count} exceeds max` };
    }
    const cost = this.calculateCost(currentLevel, count);
    if (cost > bladeburner.skillPoints) {
      return { error: `Insufficient skill points for upgrade` };
    }
    return { available: true, cost };
  }

  getMultiplier(name: BladeMultName): number {
    return this.mults[name] ?? 0;
  }
}
