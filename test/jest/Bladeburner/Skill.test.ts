import { BladeburnerSkillName } from "@enums";
import { Skills } from "../../../src/Bladeburner/data/Skills";
import { nextafter } from "../../../src/utils/NextAfter";
import type { PositiveNumber } from "../../../src/types";
import { Skill } from "../../../src/Bladeburner/Skill";
import { currentNodeMults } from "../../../src/BitNode/BitNodeMultipliers";

const hyperdrive = Skills[BladeburnerSkillName.Hyperdrive];

describe("Bladeburner Skill", () => {
  describe("calculateMaxUpgradeCount", () => {
    it("should return 0 when currentLevel is too high for floating-point precision", () => {
      // At level 1e18, the smallest gap between numbers is 128. The cost of
      // 128 levels will be 128 * (1 + 2.5 * 127/2 + 2.5 * 1e18) = 128 * (2.5e18) = 3.2e20.
      const result = hyperdrive.calculateMaxUpgradeCountNew(1e18, nextafter(3.2e20, 0) as PositiveNumber);
      expect(result).toBe(0);
    });

    it("should return correct count at high currentLevel", () => {
      const currentLevel = 1e18;
      const cost = nextafter(3.2e20, 1e99) as PositiveNumber;
      const result = hyperdrive.calculateMaxUpgradeCountNew(currentLevel, cost);
      expect(result).toBe(191);
      expect(currentLevel + result).toBe(1.0000000000000001e18);
    });

    it("should return correct count at normal levels", () => {
      // At level 0 with cost 1, baseCost 1, costInc 2.5:
      // cost of 1 level = round(1 * 1 * (1 + 2.5 * (0 + 0/2))) = round(1) = 1
      const result = hyperdrive.calculateMaxUpgradeCountNew(0, 1 as PositiveNumber);
      expect(result).toBe(1);
    });

    it("should return 0 when cost is less than the price of one level", () => {
      // At level 10: cost of 1 level = round(1 * 1 * (1 + 2.5 * 10)) = 26
      const costOfOne = hyperdrive.calculateCost(10);
      const result = hyperdrive.calculateMaxUpgradeCountNew(10, (costOfOne - 1) as PositiveNumber);
      expect(result).toBe(0);
    });

    it("edge cases", () => {
      const skill = new Skill({
        name: BladeburnerSkillName.Hyperdrive,
        desc: "",
        baseCost: 1,
        costInc: 1,
        mults: {},
      });
      currentNodeMults.BladeburnerSkillCost = 1;

      // True result is smaller than r0.
      // The binary search enters an infinite loop if the granularity floor check is removed.
      expect(skill.calculateMaxUpgradeCountNew(2048, 2.049e32 as PositiveNumber)).toBe(20243517480910200);

      // numericallyStableSeed is NaN.
      expect(skill.calculateMaxUpgradeCountNew(1, 1e308 as PositiveNumber)).toBe(1.414213562373095e154);

      // countMin calculation enters an infinite loop if the granularity floor check is removed.
      expect(skill.calculateMaxUpgradeCountNew(1e35, 1 as PositiveNumber)).toBe(0);
    });
  });
});
