import { PositiveInteger } from "../../src/types";
import { Corporation } from "../../src/Corporation/Corporation";
import { CorpUpgrades } from "../../src/Corporation/data/CorporationUpgrades";
import {
  calculateMaxAffordableUpgrade,
  calculateUpgradeCost,
  calculateOfficeSizeUpgradeCost,
} from "../../src/Corporation/helpers";
import { Player, setPlayer } from "../../src/Player";
import { PlayerObject } from "../../src/PersonObjects/Player/PlayerObject";
import {
  acceptInvestmentOffer,
  buyBackShares,
  convertAmountString,
  convertPriceString,
  goPublic,
  issueNewShares,
  sellShares,
} from "../../src/Corporation/Actions";

describe("Corporation", () => {
  let corporation: Corporation;

  beforeEach(() => {
    setPlayer(new PlayerObject());
    Player.init();
    corporation = new Corporation({ name: "Test" });
  });

  describe("helpers.calculateUpgradeCost", () => {
    it("should have fixed formula", () => {
      for (let currentUpgradeLevel = 0; currentUpgradeLevel < 5; currentUpgradeLevel++) {
        Object.values(CorpUpgrades).forEach((upgrade) => {
          corporation.upgrades[upgrade.name].level = currentUpgradeLevel;

          for (let targetUpgradeLevel = currentUpgradeLevel + 1; targetUpgradeLevel < 6; targetUpgradeLevel++) {
            const calculatedCost = calculateUpgradeCost(
              upgrade.basePrice,
              upgrade.priceMult,
              currentUpgradeLevel,
              targetUpgradeLevel as PositiveInteger,
            );
            expect(calculatedCost).toMatchSnapshot(
              `${upgrade.name}: from ${currentUpgradeLevel} to ${targetUpgradeLevel}`,
            );
          }
        });
      }
    });
  });

  describe("helpers.calculateMaxAffordableUpgrade", () => {
    it("should return zero for negative funds", () => {
      corporation.funds = -1;

      Object.values(CorpUpgrades).forEach((upgrade) => {
        expect(calculateMaxAffordableUpgrade(corporation, upgrade)).toBe(0);
      });
    });

    it("should return zero for zero funds", () => {
      corporation.funds = 0;

      Object.values(CorpUpgrades).forEach((upgrade) => {
        expect(calculateMaxAffordableUpgrade(corporation, upgrade)).toBe(0);
      });
    });

    it("should be in sync with 'calculateUpgradeCost'", () => {
      for (let currentUpgradeLevel = 0; currentUpgradeLevel < 100; currentUpgradeLevel++) {
        Object.values(CorpUpgrades).forEach((upgrade) => {
          corporation.upgrades[upgrade.name].level = currentUpgradeLevel;

          for (let targetUpgradeLevel = currentUpgradeLevel + 1; targetUpgradeLevel < 100; targetUpgradeLevel++) {
            const calculatedCost = calculateUpgradeCost(
              upgrade.basePrice,
              upgrade.priceMult,
              currentUpgradeLevel,
              targetUpgradeLevel as PositiveInteger,
            );
            corporation.funds = calculatedCost + 1; // +1 for floating point accuracy issues
            expect(calculateMaxAffordableUpgrade(corporation, upgrade)).toEqual(targetUpgradeLevel);
          }
        });
      }
    });
  });

  describe("Corporation totalShares", () => {
    function expectSharesToAddUp(corp: Corporation) {
      expect(corp.totalShares).toEqual(corp.numShares + corp.investorShares + corp.issuedShares);
    }

    it("should equal the sum of each kind of shares", () => {
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by seed funding", () => {
      const seedFunded = true;
      Player.startCorporation("TestCorp", seedFunded);
      if (!Player.corporation) {
        throw new Error("Player.startCorporation failed to create a corporation.");
      }
      expectSharesToAddUp(Player.corporation);
    });
    it("should be preserved by acceptInvestmentOffer", () => {
      acceptInvestmentOffer(corporation);
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by goPublic", () => {
      const numShares = 1e8;
      goPublic(corporation, numShares);
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by IssueNewShares", () => {
      const numShares = 1e8;
      goPublic(corporation, numShares);
      corporation.issueNewSharesCooldown = 0;
      issueNewShares(corporation, numShares);
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by BuyBackShares", () => {
      const numShares = 1e8;
      goPublic(corporation, numShares);
      buyBackShares(corporation, numShares);
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by SellShares", () => {
      const numShares = 1e8;
      goPublic(corporation, numShares);
      corporation.shareSaleCooldown = 0;
      sellShares(corporation, numShares);
      expectSharesToAddUp(corporation);
    });
  });

  describe("helpers.calculateOfficeSizeUpgradeCost matches documented formula", () => {
    // for discussion and computation of these test values, see:
    // https://github.com/bitburner-official/bitburner-src/pull/1179#discussion_r1534948725
    it.each([
      { fromSize: 3, increaseBy: 3, expectedCost: 4360000000.0 },
      { fromSize: 3, increaseBy: 15, expectedCost: 26093338259.6 },
      { fromSize: 3, increaseBy: 150, expectedCost: 3553764305895.24902 },
      { fromSize: 6, increaseBy: 3, expectedCost: 4752400000.0 },
      { fromSize: 6, increaseBy: 15, expectedCost: 28441738702.964 },
      { fromSize: 6, increaseBy: 150, expectedCost: 3873603093425.821 },
      { fromSize: 9, increaseBy: 3, expectedCost: 5180116000.0 },
      { fromSize: 9, increaseBy: 15, expectedCost: 31001495186.23076 },
      { fromSize: 9, increaseBy: 150, expectedCost: 4222227371834.145 },
    ])(
      "should cost $expectedCost to upgrade office by $increaseBy from size $fromSize",
      ({ fromSize, increaseBy, expectedCost }) => {
        expect(calculateOfficeSizeUpgradeCost(fromSize, increaseBy as PositiveInteger)).toBeCloseTo(expectedCost, 1);
      },
    );
  });

  describe("convertPriceString", () => {
    it("should pass normally", () => {
      expect(convertPriceString("MP")).toStrictEqual("MP");
      expect(convertPriceString("MP+1")).toStrictEqual("MP+1");
      expect(convertPriceString("MP+MP")).toStrictEqual("MP+MP");
      expect(convertPriceString("123")).toStrictEqual("123");
      expect(convertPriceString("123+456")).toStrictEqual("123+456");
      expect(convertPriceString("1e10")).toStrictEqual("1e10");
      expect(convertPriceString("1E10")).toStrictEqual("1E10");
    });
    it("should throw errors", () => {
      expect(() => convertPriceString("")).toThrow();
      expect(() => convertPriceString("null")).toThrow();
      expect(() => convertPriceString("undefined")).toThrow();
      expect(() => convertPriceString("Infinity")).toThrow();
      expect(() => convertPriceString("abc")).toThrow();
    });
  });

  describe("convertAmountString", () => {
    it("should pass normally", () => {
      expect(convertAmountString("MAX")).toStrictEqual("MAX");
      expect(convertAmountString("PROD")).toStrictEqual("PROD");
      expect(convertAmountString("INV")).toStrictEqual("INV");
      expect(convertAmountString("MAX+1")).toStrictEqual("MAX+1");
      expect(convertAmountString("MAX+MAX")).toStrictEqual("MAX+MAX");
      expect(convertAmountString("MAX+PROD+INV")).toStrictEqual("MAX+PROD+INV");
      expect(convertAmountString("123")).toStrictEqual("123");
      expect(convertAmountString("123+456")).toStrictEqual("123+456");
      expect(convertAmountString("1e10")).toStrictEqual("1e10");
      expect(convertAmountString("1E10")).toStrictEqual("1E10");
    });
    it("should throw errors", () => {
      expect(() => convertAmountString("")).toThrow();
      expect(() => convertAmountString("null")).toThrow();
      expect(() => convertAmountString("undefined")).toThrow();
      expect(() => convertAmountString("Infinity")).toThrow();
      expect(() => convertAmountString("abc")).toThrow();
    });
  });
});
