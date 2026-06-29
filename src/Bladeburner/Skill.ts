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

  getActualUpgradeCount(currentLevel: number, count: number): number {
    // This avoids an exploit where at high currentLevels, skills can be bought more cheaply by manipulating
    // rounding. Adding "count" to "currentLevel" will round in these circumstances because not all integer values
    // are representable; this leads to potentially getting more levels than we asked for. By performing the same
    // rounding here, we calculate the cost for the number of levels we will actually get.
    return currentLevel + count - currentLevel;
  }

  calculateCost(currentLevel: number, count = 1 as PositiveInteger): number {
    if (!isFinite(count) || !isFinite(currentLevel)) return Number.POSITIVE_INFINITY;

    const actualCount = this.getActualUpgradeCount(currentLevel, count);
    // Edge case: If currentLevel is too high, the calculation below can result in NaN.
    if (actualCount === 0) return 0;
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
    // Check edge cases.
    if (Number.isNaN(currentLevel) || Number.isNaN(cost)) {
      return Number.NaN;
    }
    if (cost < this.baseCost) {
      return 0;
    }
    if (!Number.isFinite(cost)) {
      return Number.POSITIVE_INFINITY;
    }
    if (!Number.isFinite(currentLevel)) {
      return 0;
    }
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
     * Since a, c, and y are all greater than 0:
     *
     * Delta = sqrt(m^2 + 2y/(a*c)) > |m|
     *
     * Therefore:
     *
     * x_2 = -Delta - m < -|m| - m <= 0
     *
     * Since the first inequality is strict, x_2 < 0. Thus, x_1 is the only non-negative solution.
     *
     * However, calculating it directly in this form will lead to catastrophic cancellation when m gets large.
     * So, multiply top and bottom by (Delta + m):
     *
     * x_1 = (Delta - m)(Delta + m)/(Delta + m)
     *     = (Delta^2 - m^2)/(Delta + m)
     *     = (m^2 + 2y/(a*c) - m^2)/(Delta + m)
     *     = (2y/(a*c))/(Delta + m)
     *
     * Both y and d can be very large numbers, ranging up to MAX_VALUE.
     * However, they are never *small* numbers - we don't have to worry about underflow.
     * So, we multiply top and bottom of the final equation by 2^-500 to shift the ranges of the exponent from
     * [0, 1024] to [-500, 524], such that we don't have to worry about overflows.
     * Note that it is still possible for the expression "m * m" to overflow to Infinity if d > 2**1012, since
     * at this range m > 2**512. However, for all d > ~2**537 the result will be zero anyway, so this is not an issue.
     */
    const m = 2 ** -500 * (this.baseCost / this.costInc) + 2 ** -500 * currentLevel - 2 ** -501;
    const yac = (2 ** -499 * cost) / (currentNodeMults.BladeburnerSkillCost * this.costInc);
    const delta = Math.sqrt(m * m + 2 ** -500 * yac);
    const result = yac / (delta + m);
    /**
     * Now we have to find the actual answer. We use the perspective of "final level" rather than amount, because that
     * has the property that at large values it rounds correctly - the available amounts that can be used aren't the
     * whole range of integers anymore, but are only restricted to a smaller set of powers of 2. For small values, the
     * final level will be an integer.
     * We start with an initial guess, and then depending on if it was high or low, we search linearly until the guess
     * changes result. The speed (but not correctness) relies on the fact that our initial guess will be very close -
     * almost always within 1 (or 1 ulp for large values) of the correct answer.
     */
    const finalLevel = Math.round(currentLevel + result);
    let x = finalLevel;
    if (this.calculateCost(currentLevel, finalLevel - currentLevel as PositiveInteger) <= cost) {
      // Search upwards. This loop *will* terminate because eventually calculateCost will return Infinity,
      // and from the edge-checks above we know cost < Infinity.
      while (true) {
        const prev = x;
        x = Math.max(x + 1, nextafter(x, Number.POSITIVE_INFINITY));
        if (this.calculateCost(currentLevel, x - currentLevel as PositiveInteger) > cost) {
          return prev - currentLevel;
        }
      }
    } else {
      let i = 0;
      // Search downwards. This loop *will* terminate because eventually x will be currentLevel.
      while (true) {
        // We need an explicit check because x can start at currentLevel.
        if (x <= currentLevel) return 0;
        x = Math.min(x - 1, nextafter(x, 0));
        if (this.calculateCost(currentLevel, x - currentLevel as PositiveInteger) <= cost) {
          return x - currentLevel;
        }
      }
    }
  }

  calculateMaxUpgradeCountNew(currentLevel: number, cost: PositiveNumber): number {
    // Sanity checks for bnMult and skill settings. Callers should already check currentLevel and cost.
    if (currentNodeMults.BladeburnerSkillCost <= 0 || this.baseCost <= 0 || this.costInc <= 0) {
      throw new Error(
        `Invalid bnMult or skill settings. BladeburnerSkillCost: ${currentNodeMults.BladeburnerSkillCost}, baseCost: ${this.baseCost}, costInc: ${this.costInc}`,
      );
    }

    // Find the smallest count that registers a real, nonzero level change. The dead zone below this can span more than
    // one count, so this needs its own search, not a single fixed check at count = 1.
    let lo = 0;
    let hi = 1;
    while (this.getActualUpgradeCount(currentLevel, hi) === 0) {
      lo = hi;
      hi *= 2;
    }
    // At extreme magnitudes, the gap between adjacent representable doubles can exceed 1, so "hi - lo > 1" would never
    // become false and the loop would spin indefinitely. The "mid === lo || mid === hi" check would break the loop in
    // that case.
    while (hi - lo > 1) {
      const mid = lo + Math.floor((hi - lo) / 2);
      // Granularity floor, can't narrow further
      if (mid === lo || mid === hi) {
        break;
      }
      if (this.getActualUpgradeCount(currentLevel, mid) === 0) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const countMin = hi;

    const isAffordable = (count: number) =>
      count >= countMin && this.calculateCost(currentLevel, count as PositiveInteger) <= cost;

    // Return early if even the cheapest viable request is not affordable.
    if (!isAffordable(countMin)) {
      return 0;
    }

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
     * Since a, c, and y are all greater than 0:
     *
     * Delta = sqrt(m^2 + 2y/(a*c)) > |m|
     *
     * Therefore:
     *
     * x_2 = -Delta - m < -|m| - m <= 0
     *
     * Since the first inequality is strict, x_2 < 0. Thus, x_1 is the only non-negative solution.
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
    const numericallyStableEstimate = yac / (delta + m);

    let seed = Math.round(numericallyStableEstimate);
    if (!Number.isFinite(seed) || seed < countMin) {
      seed = countMin;
    }

    // Expand outward from the seed to bracket the true boundary.
    // After this step, it's guaranteed that lower is affordable and upper is not.
    let lower = countMin;
    let upper = seed;
    let step = Math.max(1, seed - countMin);
    // This loop cannot be infinite. If upper is a too high finite value (not affordable) or Infinity, isAffordable will
    // return false.
    while (isAffordable(upper)) {
      lower = upper;
      upper += step;
      step *= 2;
    }

    // Binary search the exact boundary.
    // Same comment about the "upper - lower > 1" case and the "mid === lower || mid === upper" check as above.
    while (upper - lower > 1) {
      const mid = lower + Math.floor((upper - lower) / 2);
      if (mid === lower || mid === upper) {
        break;
      }
      if (isAffordable(mid)) {
        lower = mid;
      } else {
        upper = mid;
      }
    }

    return lower;
  }

  canUpgrade(bladeburner: Bladeburner, count = 1): Availability<{ actualCount: number; cost: number }> {
    const currentLevel = bladeburner.skills[this.name] ?? 0;
    const actualCount = this.getActualUpgradeCount(currentLevel, count);
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
