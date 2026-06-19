import type { BladeburnerMultName, BladeburnerSkillName } from "@enums";

import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Bladeburner } from "./Bladeburner";
import { Availability } from "./Types";
import { nextafter } from "../utils/NextAfter";
import { type PositiveInteger, type PositiveNumber, isPositiveInteger } from "../types";
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
    // This avoids an exploit where at high currentLevels, skills can be bought more cheaply by manipulating
    // rounding. Adding "count" to "currentLevel" will round in these circumstances because not all integer values
    // are representable; this leads to potentially getting more levels than we asked for. By performing the same
    // rounding here, we calculate the cost for the number of levels we will actually get.
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
     * [3] and [4] are not equivalent to [1] and [2] respectively, but it's much easier to find the closed forms of [3]
     * and [4] than [1] and [2]. After testing, we conclude that the cost calculated by [4] is a good approximation of
     * [2], so we choose [4] to calculate the cost. In order to calculate the cost with a big "count", we accept the
     * slight inaccuracy.
     *
     * The closed form of [4]:
     *
     * $$Cost = \mathrm{Round}(Count \ast Mult \ast (BaseCost + (CostInc \ast (CurrentLevel + \frac{Count - 1}{2}))))$$
     *
     * We rearrange slightly for greater accuracy, because CurrentLevel is often much higher than Count but Count and
     * BaseCost are usually closer in magnitude:
     *
     * $$Cost = \mathrm{Round}(Count \ast Mult \ast (BaseCost + CostInc \ast \frac{Count - 1}{2} + CostInc \ast CurrentLevel))$$
     *
     */
    return Math.round(
      actualCount *
        currentNodeMults.BladeburnerSkillCost *
        (this.baseCost + this.costInc * (actualCount - 1) * 0.5 + this.costInc * currentLevel),
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
     * y = round(x*a*(b + c*(d + (x - 1)/2)))
     *
     * To simplify the calculation, let's ignore the Math.round part:
     *
     * y = x*a*(b + c*(d + (x - 1)/2))
     *
     * Divide by a and c to simplify things, multiply by 2 to help complete the square:
     *
     * 2y/(a*c) = 2x*(b/c + d + (x - 1)/2)
     *          = x^2 + 2x*(b/c + d - 1/2)
     *
     * Solve for x in terms of everything else:
     *
     * Define:
     *
     * m = b/c + d - 1/2
     *
     * 2y/(a*c) = x^2 + 2x*m
     * m^2 + 2y/(a*c) = x^2 + 2xm + m^2 = (x + m)^2
     *
     * Define:
     *
     * Delta = sqrt(m^2 + 2y/(a*c))
     *
     * Solutions:
     *
     * x_1 = Delta - m
     *
     * x_2 = -Delta - m
     *
     * a, c and y are always greater than 0, so x_2 is always less than 0. Therefore, x_1 is the only solution.
     *
     * However, calculating it directly in this form will lead to catastrophic cancellation when m gets large.
     * So, multiply top and bottom by (Delta + m):
     *
     * x_1 = (Delta - m)(Delta + m)/(Delta + m)
     *     = (Delta^2 - m^2)/(Delta + m)
     *     = (m^2 + 2y/(a*c) - m^2)/(Delta + m)
     *     = (2y/(a*c))/(Delta + m)
     */
    const m = this.baseCost / this.costInc + currentLevel - 0.5;
    const yac = (2 * cost) / (currentNodeMults.BladeburnerSkillCost * this.costInc);
    const delta = Math.sqrt(m * m + yac);
    const result = yac / (delta + m);
    /**
     * Now we have to find the actual answer. We search a window that includes the (rounded) result as well as the next
     * higher and lower numbers. For reasons that I believe can be proven but am only handwaving here, the true result
     * will lie in this window, so checking these three values will be sufficient.
     */
    let r0, r1, r2;
    const nextLevel = currentLevel + result;
    // MAX_SAFE_INTEGER (+1) is the first point where intervals between numbers become 2, so not all integers are
    // representable. Half this value is the first point where intervals between numbers become *1*, which is very
    // important for rounding.
    const HALF_SAFE = (Number.MAX_SAFE_INTEGER + 1) / 2;
    if (nextLevel > HALF_SAFE) {
      // Because the result is *strictly greater* than HALF_SAFE, we know that both the successor and predecessor
      // will also be integers. So we use nextafter() to find these values to
      // form our window. The simple addition will correctly round nextLevel, the middle of our range.
      r1 = nextLevel - currentLevel;
      r2 = nextafter(nextLevel, Number.POSITIVE_INFINITY) - currentLevel;
      r0 = nextafter(nextLevel, 0) - currentLevel;
    } else {
      // Since the (rounded) sum is <= HALF_SAFE, we know the rounded result alone is also <= HALF_SAFE.
      // So we can operate directly on the rounded result, +-1.
      r1 = Math.round(result);
      r2 = r1 + 1;
      r0 = r1 - 1;
    }
    const costOfResultPlus = this.calculateCost(currentLevel, r2 as PositiveInteger);
    if (costOfResultPlus <= cost) {
      return r2;
    }
    const costOfResult = this.calculateCost(currentLevel, r1 as PositiveInteger);
    if (costOfResult <= cost) {
      return r1;
    }
    return r0;
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
