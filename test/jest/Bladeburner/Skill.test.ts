import { BladeburnerSkillName } from "@enums";
import { Skills } from "../../../src/Bladeburner/data/Skills";
import { Skill } from "../../../src/Bladeburner/Skill";
import { nextafter } from "../../../src/utils/NextAfter";
import type { PositiveInteger, PositiveNumber } from "../../../src/types";
import { currentNodeMults } from "../../../src/BitNode/BitNodeMultipliers";

const hyperdrive = Skills[BladeburnerSkillName.Hyperdrive];

// Given two Uint32s (presumably randomly generated), return a floating point
// value for testing. The first part of the tuple is an integer, and the 2nd
// is a multiplier of the form 2**x. The values are designed for use with
// calculateCost: half the time the multiplier will be 1, and the multiplier
// won't exceed 2**512 (since after this point all results will be Infinity).
function getValue(uint1: number, uint2: number): [number, number] {
  if (uint2 < 2 ** 31) {
    // One-half chance of a simple integer. It will span [0, 2**53).
    const high = (uint2 & 0x1fffff) * 2 ** 32;
    return [uint1 + high, 1];
  } else {
    // Use the representation of a double to create an integer spanning
    // [2**52, 2**53). The multiplier will be a minimum of 2.
    // Exponent bits: 1023 + 52 = 1075 = 0x433
    const high_bits = (uint2 & 0xfffff) | 0x4330_0000;
    const utyped = Uint32Array.of(uint1, high_bits);
    const ftyped = new Float64Array(utyped.buffer);
    const r0 = ftyped[0];
    utyped[0] = 0;
    // Exponent bits: 1024 = 0x400 corresponds to 2**1
    utyped[1] = (uint2 & 0x1ff0_0000) + 0x4000_0000;
    return [r0, ftyped[0]];
  }
}

describe("Bladeburner Skill", () => {
  // calculateCost is only behind callsites that check its arguments, so we don't need to
  // test for NaN. Add those tests if that changes.
  describe("calculateCost", () => {
    it("MAX_VALUE arg 1", () => {
      const result = hyperdrive.calculateCost(Number.MAX_VALUE, 1 as PositiveInteger);
      expect(result).toBe(0);
    });

    it("MAX_VALUE arg 2", () => {
      const result = hyperdrive.calculateCost(0, Number.MAX_VALUE as PositiveInteger);
      expect(result).toBe(Infinity);
    });

    it("MAX_VALUE arg both", () => {
      const result = hyperdrive.calculateCost(Number.MAX_VALUE, Number.MAX_VALUE as PositiveInteger);
      expect(result).toBe(Infinity);
    });

    it("Inf arg 1", () => {
      const result = hyperdrive.calculateCost(Infinity, 1 as PositiveInteger);
      expect(result).toBe(Infinity);
    });

    it("Inf arg 2", () => {
      const result = hyperdrive.calculateCost(0, Infinity as PositiveInteger);
      expect(result).toBe(Infinity);
    });

    it("Inf arg both", () => {
      const result = hyperdrive.calculateCost(Infinity, Infinity as PositiveInteger);
      expect(result).toBe(Infinity);
    });

    it("Last possible upgrade", () => {
      const level = 2 ** 537 * 1.6 - 2 ** 486;
      let result = hyperdrive.calculateCost(level, (2 ** 485) as PositiveInteger);
      expect(result).toBe(Number.MAX_VALUE);

      // Can't upgrade again
      result = hyperdrive.calculateCost(level + 2 ** 485, (2 ** 485) as PositiveInteger);
      expect(result).toBe(Infinity);

      // Can't add a smaller increment
      expect(level + 2 ** 484).toBe(level);
    });
  });

  describe("calculateMaxUpgradeCount", () => {
    it("NaN arg 1", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(NaN, 1 as PositiveNumber);
      expect(result).toBe(NaN);
    });

    it("NaN arg 2", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(0, NaN as PositiveNumber);
      expect(result).toBe(NaN);
    });

    it("Inf arg 1", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(Infinity, 1 as PositiveNumber);
      expect(result).toBe(0);
    });

    it("Inf arg 2", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(0, Infinity as PositiveNumber);
      expect(result).toBe(Infinity);
    });

    it("Inf arg both", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(Infinity, Infinity as PositiveNumber);
      expect(result).toBe(Infinity);
    });

    it("MAX_VALUE arg 1", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(Number.MAX_VALUE, 1 as PositiveNumber);
      expect(result).toBe(0);
    });

    it("MAX_VALUE arg 2", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(0, Number.MAX_VALUE as PositiveNumber);
      expect(result).toBe(nextafter(2 ** 512 / Math.sqrt(1.25), 0));
    });

    it("MAX_VALUE arg both", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(Number.MAX_VALUE, Number.MAX_VALUE as PositiveNumber);
      expect(result).toBe(0);
    });

    it("infinite loop in downward search", () => {
      const testSkill = new Skill({
        name: BladeburnerSkillName.Cloak,
        desc: "test",
        baseCost: 0,
        costInc: 0,
        mults: {},
      });
      expect(() => testSkill.calculateMaxUpgradeCount(1, 1 as PositiveNumber)).toThrow();
    });

    it("mult < 1", () => {
      const testSkill = new Skill({
        name: BladeburnerSkillName.Cloak,
        desc: "test",
        baseCost: 10,
        costInc: 1,
        mults: {},
      });
      currentNodeMults.BladeburnerSkillCost = 0.5;
      try {
        expect(testSkill.calculateMaxUpgradeCount(0, 6 as PositiveNumber)).toBe(1);
      } finally {
        currentNodeMults.BladeburnerSkillCost = 1;
      }
    });

    it("Example that tests a rounding edge case", () => {
      // See the comments on https://github.com/bitburner-official/bitburner-src/pull/2905 for more details
      const testSkill = new Skill({
        name: BladeburnerSkillName.Cloak,
        desc: "test",
        baseCost: 1,
        costInc: 1,
        mults: {},
      });
      const result = testSkill.calculateMaxUpgradeCount(2048, 2.049e32 as PositiveNumber);
      expect(result).toBe(20243517480910200);
    });

    it("should return 0 when currentLevel is too high for floating-point precision", () => {
      // At level 1e18, the smallest gap between numbers is 128. The cost of
      // 128 levels will be 128 * (1 + 2.5 * 127/2 + 2.5 * 1e18) = 128 * (2.5e18) = 3.2e20.
      const result = hyperdrive.calculateMaxUpgradeCount(1e18, nextafter(3.2e20, 0) as PositiveNumber);
      expect(result).toBe(0);
    });

    it("should return correct count at high currentLevel", () => {
      const result = hyperdrive.calculateMaxUpgradeCount(1e18, nextafter(3.2e20, 1e99) as PositiveNumber);
      expect(result).toBe(128);
    });

    it("should return correct count at normal levels", () => {
      // At level 0 with cost 1, baseCost 1, costInc 2.5:
      // cost of 1 level = round(1 * 1 * (1 + 2.5 * (0 + 0/2))) = round(1) = 1
      const result = hyperdrive.calculateMaxUpgradeCount(0, 1 as PositiveNumber);
      expect(result).toBe(1);
    });

    it("should return 0 when cost is less than the price of one level", () => {
      // At level 10: cost of 1 level = round(1 * 1 * (1 + 2.5 * 10)) = 26
      const costOfOne = hyperdrive.calculateCost(10);
      const result = hyperdrive.calculateMaxUpgradeCount(10, (costOfOne - 1) as PositiveNumber);
      expect(result).toBe(0);
    });

    // This test chooses random values to generate a cost via calculateCost, and then tests that
    // calculateMaxUpgradeCount matches it for the chosen parameters and finds a smaller value when given slightly less
    // cost. Even for such a straightforward-sounding test, there are a lot of complexities involved in choosing correct
    // values, due to floating-point issues.
    it("test random values", () => {
      // Basic tests of our helper
      expect(getValue(0, 0)).toStrictEqual([0, 1]);
      expect(getValue(1, 0)).toStrictEqual([1, 1]);
      expect(getValue(0xffff_ffff, 0x7fff_ffff)).toStrictEqual([Number.MAX_SAFE_INTEGER, 1]);
      expect(getValue(0, 0x8000_0000)).toStrictEqual([2 ** 52, 2]);

      const typed = new Uint32Array(4);
      // When the implementation was insufficient or the test itself had problems,
      // 1000 iterations was enough to practically guarantee a failure or infinite loop.
      // 5000 runs very quickly, so we select that for safety.
      for (let i = 0; i < 5000; ) {
        // We don't need secure values, we just want a guaranteed number of random bits.
        // (Math.random has no guarantees for how much randomness it provides.)
        crypto.getRandomValues(typed);
        const [v1, v1mul] = getValue(typed[0], typed[1]);
        const [v2, v2mul] = getValue(typed[2], typed[3]);
        const level = v1 * v1mul;
        // This is also scaled by v1mul because otherwise amount would round to 0.
        let amount = v2 * v2mul * v1mul;
        // amount might not be properly rounded due to collectively crossing a 2**x precision boundary.
        amount = level + amount - level;
        const cost = hyperdrive.calculateCost(level, amount as PositiveInteger);
        // Rejection-sample: Simply try again if these parameters are out-of-bounds. Most of them are in-bounds.
        if (!Number.isFinite(cost)) continue;
        // If this test ever hits an infinite loop, console.log'ing won't help because jest does stuff to it.
        // In that case, uncomment this line to find the problematic parameters.
        // process.stderr.write(`With parameters {level:${level}, cost:${cost}, amount:${amount}}\n`);

        // We have to advance to the *biggest* amount.
        for (;;) {
          // The middle term seems spurious here. However, when amount and level are both large enough that the gap is
          // larger than 1, and amount >> level, and level is exactly halfway between two representable amounts, we can
          // get a situation where the last term returns amount again due to ties-to-even rounding.
          const nextAmount = Math.max(
            amount + 1,
            nextafter(amount, Number.POSITIVE_INFINITY),
            nextafter(level + amount, Number.POSITIVE_INFINITY) - level,
          );
          if (hyperdrive.calculateCost(level, nextAmount as PositiveInteger) > cost) {
            break;
          }
          amount = nextAmount;
        }
        const prevCost = Math.min(cost - 1, nextafter(cost, 0));
        // Because the parameters to this test are random, it is conceivable for this test to be flaky on one of
        // these next two lines. However, any failures here are *real*, and the test log should have enough
        // info to reliably reproduce the issue (call it with the same params) and thus fix it.
        try {
          expect(hyperdrive.calculateMaxUpgradeCount(level, cost as PositiveNumber)).toBe(amount);
          expect(hyperdrive.calculateMaxUpgradeCount(level, prevCost as PositiveNumber)).toBeLessThan(amount);
        } catch (e) {
          throw new Error(`With parameters {level:${level}, cost:${cost}, prevCost:${prevCost}, amount:${amount}}`, {
            cause: e,
          });
        }
        i++; // Not in the loop body so we can rejection-sample
      }
    });
  });
});
