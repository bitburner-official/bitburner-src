import { BladeburnerSkillName } from "@enums";
import { Skills } from "../../../src/Bladeburner/data/Skills";
import { nextafter } from "../../../src/utils/NextAfter";
import type { PositiveNumber } from "../../../src/types";

const hyperdrive = Skills[BladeburnerSkillName.Hyperdrive];

describe("Bladeburner Skill", () => {
  describe("calculateMaxUpgradeCount", () => {
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
  });
});
