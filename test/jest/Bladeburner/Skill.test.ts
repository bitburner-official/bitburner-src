import { BladeburnerMultName, BladeburnerSkillName } from "@enums";
import { Skill } from "../../../src/Bladeburner/Skill";
import { PositiveNumber } from "../../../src/types";

const hyperdrive = new Skill({
  name: BladeburnerSkillName.Hyperdrive,
  desc: "test",
  baseCost: 1,
  costInc: 2.5,
  mults: { [BladeburnerMultName.ExpGain]: 10 },
});

describe("Bladeburner Skill", () => {
  describe("calculateMaxUpgradeCount", () => {
    it("should return 0 when currentLevel is too high for floating-point precision", () => {
      // At level 1e50, adding 1 is below float64 precision: 1e50 + 1 === 1e50
      // So calculateCost returns 0 for any count, and no upgrade is possible
      const result = hyperdrive.calculateMaxUpgradeCount(1e50, 1 as PositiveNumber);
      expect(result).toBe(0);
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
