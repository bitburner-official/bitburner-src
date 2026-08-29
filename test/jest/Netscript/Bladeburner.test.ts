import { currentNodeMults } from "../../../src/BitNode/BitNodeMultipliers";
import { Skill } from "../../../src/Bladeburner/Skill";
import { BladeburnerSkillName } from "../../../src/Enums";
import { PositiveInteger, isPositiveInteger, isPositiveNumber } from "../../../src/types";
import { randomInRange } from "../../../src/utils/helpers/randomInRange";
import { getRandomIntInclusive } from "../../../src/utils/helpers/getRandomIntInclusive";
import { Skills } from "../../../src/Bladeburner/data/Skills";

const skill = new Skill({
  name: BladeburnerSkillName.Hyperdrive,
  desc: "",
  baseCost: 1,
  costInc: 1,
  mults: {},
});

describe("Bladeburner Skill Costs", () => {
  const range = (from: number, to: number) =>
    Array.from(Array(Math.abs(to - from + 1)).keys(), (x) => (x + from) as PositiveInteger);

  describe("Cost is always positive", () => {
    describe("Scenario: Early-mid game", () => {
      it.each(range(1, 5))("Cost of 1 skill at 10^%d level is positive", (levelMagnitude) => {
        expect(Skills.Hyperdrive.calculateCost(10 ** levelMagnitude)).toBeGreaterThan(0);
      });
    });

    describe("Scenario: Int farming", () => {
      /** ~ 1bil -> 1e35 is a reasonable Hyperdrive skill level for an int farmer as of 2.6.2 */
      it.each(range(6, 35))("Cost of 1 skill at 10^%d level is positive", (levelMagnitude) => {
        expect(Skills.Hyperdrive.calculateCost(10 ** levelMagnitude)).toBeGreaterThan(0);
      });

      it.each(range(2, 50))("Cost of %d skills at 10^25 level is positive", (count: PositiveInteger) => {
        expect(Skills.Hyperdrive.calculateCost(10 ** 25, count)).toBeGreaterThan(0);
      });
    });
  });

  describe("Max Upgrade Count is always greater than 1 when (available points > cost of 1 upgrade)", () => {
    it.each(range(1, 4))("Buying for +10^%d points at level 1", (skillMagnitude) => {
      const costOf1 = Skills.Hyperdrive.calculateCost(1);
      expect(Skills.Hyperdrive.calculateMaxUpgradeCount(1, costOf1 + 10 ** skillMagnitude)).toBeGreaterThan(0);
    });

    it.each(range(1, 6))("Buying for +10^%d points at level 35000", (skillMagnitude) => {
      const costOf1 = Skills.Hyperdrive.calculateCost(35000);
      expect(Skills.Hyperdrive.calculateMaxUpgradeCount(35000, costOf1 + 10 ** skillMagnitude)).toBeGreaterThan(0);
    });

    it.each(range(50, 60))("Buying for +10^%d points at level 1e25", (skillMagnitude) => {
      const costOf1 = Skills.Hyperdrive.calculateCost(1e25);
      expect(Skills.Hyperdrive.calculateMaxUpgradeCount(1e25, costOf1 + 10 ** skillMagnitude)).toBeGreaterThan(0);
    });

    it.each(range(25, 35))("Buying for endless budget at level 10^%d", (levelMagnitude) => {
      expect(Skills.Hyperdrive.calculateMaxUpgradeCount(10 ** levelMagnitude, Number.MAX_VALUE - 1)).toBeGreaterThan(0);
    });
  });
});

describe("Test calculateMaxUpgradeCount", function () {
  test("errorCount", () => {
    let testCaseCount = 0;
    let errorCount = 0;
    const test1Errors = [];
    const test2Errors = [];
    for (let i = 0; i < 8; ++i) {
      skill.baseCost = getRandomIntInclusive(1, 1000);
      for (let j = 0; j < 8; ++j) {
        skill.costInc = randomInRange(1, 1000);
        for (let k = 0; k < 8; ++k) {
          currentNodeMults.BladeburnerSkillCost = randomInRange(1, 1000);
          for (let m = 0; m < 8000; ++m) {
            const currentLevel = getRandomIntInclusive(0, 1e9);
            let count = 0;
            let cost = 0;

            // Test 1
            ++testCaseCount;
            const expectedCount = getRandomIntInclusive(1, 1e9);
            if (!isPositiveInteger(expectedCount)) {
              throw new Error(`Invalid expectedCount: ${expectedCount}`);
            }
            cost = skill.calculateCost(currentLevel, expectedCount);
            if (!isPositiveNumber(cost)) {
              throw new Error(`Invalid cost: ${cost}`);
            }
            count = skill.calculateMaxUpgradeCount(currentLevel, cost);
            if (expectedCount !== count) {
              ++errorCount;
              test1Errors.push({
                baseCost: skill.baseCost,
                costInc: skill.costInc,
                mult: currentNodeMults.BladeburnerSkillCost,
                currentLevel,
                cost,
                count,
                expectedCount,
              });
            }

            // Test 2
            ++testCaseCount;
            const budget = randomInRange(1e9, 1e50);
            if (!isPositiveNumber(budget)) {
              throw new Error(`Invalid budget: ${budget}`);
            }
            count = skill.calculateMaxUpgradeCount(currentLevel, budget);
            if (!isPositiveInteger(count)) {
              throw new Error(`Invalid count: ${count}`);
            }
            cost = skill.calculateCost(currentLevel, count);
            const costOfCountPlus1 = skill.calculateCost(currentLevel, (count + 1) as PositiveInteger);
            if (count !== count + 1 && (budget < cost || budget >= costOfCountPlus1)) {
              ++errorCount;
              test2Errors.push({
                baseCost: skill.baseCost,
                costInc: skill.costInc,
                mult: currentNodeMults.BladeburnerSkillCost,
                currentLevel,
                count,
                budget,
                cost,
                costOfCountPlus1,
              });
            }
          }
        }
      }
    }
    if (errorCount !== 0) {
      // There may be hundreds of thousands or even millions of failed test cases, so we only show a limited number of them.
      console.error(
        `testCaseCount: ${testCaseCount}. errorCount: ${errorCount}. test1Errors: ${JSON.stringify(
          test1Errors.slice(0, 1000),
        )}. test2Errors: ${JSON.stringify(test2Errors.slice(0, 1000))}`,
      );
    }

    expect(errorCount).toBe(0);
  });
});
