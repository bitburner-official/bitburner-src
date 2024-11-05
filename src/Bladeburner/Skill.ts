import type { BladeburnerMultName, BladeburnerSkillName } from "@enums";

import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Bladeburner } from "./Bladeburner";
import { Availability } from "./Types";
import { PositiveInteger, PositiveNumber, isPositiveInteger } from "../types";
import { PartialRecord, getRecordEntries } from "../Types/Record";

interface SkillParams {
  name: BladeburnerSkillName;
  desc: string;
  baseCost?: number;
  costInc?: number;
  maxLvl?: number;
  mults: PartialRecord<BladeburnerMultName, number>;
}

export class Skill {
  name: BladeburnerSkillName;
  desc: string;
  // Cost is in Skill Points
  baseCost: number;
  // Additive cost increase per level
  costInc: number;
  maxLvl: number;
  mults: PartialRecord<BladeburnerMultName, number> = {};

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
     * In order to calculate the cost of "count" levels, we need to run a loop. "count" can be a big number, so it's
     * infeasible to calculate the cost in that way. We need to find the closed forms of:
     *
     * [1]:
     * $$Cost = \sum_{i = CurrentLevel}^{CurrentLevel+Count-1}\lfloor ((BaseCost + i \ast CostInc) \ast Mult) \rfloor$$
     *
     * Or:
     *
     * [2]:
     * $$Cost = \sum_{i = CurrentLevel}^{CurrentLevel+Count-1} \mathrm{Round}((BaseCost + i \ast CostInc) \ast Mult)$$
     *
     * It's really hard to find the closed forms of those two equations, so we switch to these equations:
     *
     * [3]:
     * $$Cost = \lfloor\sum_{i = CurrentLevel}^{CurrentLevel+Count-1} ((BaseCost + i \ast CostInc) \ast Mult) \rfloor$$
     *
     * Or
     *
     * [4]:
     * $$Cost = \mathrm{Round}(\sum_{i = CurrentLevel}^{CurrentLevel+Count-1} ((BaseCost + i \ast CostInc) \ast Mult))$$
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
     * $$Cost = \mathrm{Round}(Count \ast Mult \ast (BaseCost + (CostInc \ast (CurrentLevel + \frac{Count - 1}{2}))))$$
     *
     */
    return Math.round(
      actualCount *
        currentNodeMults.BladeburnerSkillCost *
        (this.baseCost + this.costInc * (currentLevel + (actualCount - 1) / 2)),
    );
  }

  calculateMaxUpgradeCount(currentLevel: number, cost: PositiveNumber): number {
    /**
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
     * $$ y = \mathrm{Round}(x \ast a \ast (b + c \ast (d + \frac{x - 1}{2})))$$
     *
     * To simplify the calculation, let's ignore the Math.round part:
     *
     * $$ y = x \ast a \ast (b + c \ast (d + \frac{x - 1}{2}))$$
     *
     * Solve for x in terms of y:
     *
     * Define:
     *
     * $$ m = -b - c \ast d + \frac{c}{2} $$
     *
     * $$ Delta = \sqrt{{m ^ 2} + \frac{2 \ast c \ast y}{a}} $$
     *
     * Solutions:
     *
     * $$ x_1 = \frac{m + Delta}{c} $$
     *
     * $$ x_2 = \frac{m - Delta}{c} $$
     *
     * $a$, $c$ and $y$ are always greater than 0, so $x_2$ is always less than 0. Therefore, $x_1$ is the only
     * solution.
     */
    const m = -this.baseCost - this.costInc * currentLevel + this.costInc / 2;
    const delta = Math.sqrt(m * m + (2 * this.costInc * cost) / currentNodeMults.BladeburnerSkillCost);
    const result = Math.round((m + delta) / this.costInc);
    /**
     * Due to floating-point rounding and edge-cases, we cannot ensure that rounding x_1 will give us the correct
     * integer. In other words, we cannot be sure that x_1 is within 0.5 of the integer value we want. However, we can
     * be sure that it is within 1 of the value we want, which means that checking the numbers above and below the
     * rounded value are sufficient to find our correct integer.
     */
    const costOfResultPlus1 = this.calculateCost(currentLevel, (result + 1) as PositiveInteger);
    if (costOfResultPlus1 <= cost) {
      return result + 1;
    }
    const costOfResult = this.calculateCost(currentLevel, result as PositiveInteger);
    if (costOfResult <= cost) {
      return result;
    }
    return result - 1;
  }

  canUpgrade(bladeburner: Bladeburner, count = 1): Availability<{ actualCount: number; cost: number }> {
    const currentLevel = bladeburner.skills[this.name] ?? 0;
    const actualCount = currentLevel + count - currentLevel;
    if (actualCount === 0) {
      return {
        error: `Cannot upgrade ${this.name}: Due to floating-point inaccuracy and the small value of specified "count", your skill cannot be upgraded.`,
      };
    }
    if (!isPositiveInteger(actualCount)) {
      return { error: `Invalid upgrade count ${actualCount}` };
    }
    if (currentLevel + actualCount > this.maxLvl) {
      return { error: `Upgraded level ${currentLevel + actualCount} exceeds max` };
    }
    const cost = this.calculateCost(currentLevel, actualCount);
    if (cost > bladeburner.skillPoints) {
      return { error: `Insufficient skill points for upgrade` };
    }
    return { available: true, actualCount, cost };
  }

  getMultiplier(name: BladeburnerMultName): number {
    return this.mults[name] ?? 0;
  }
}
