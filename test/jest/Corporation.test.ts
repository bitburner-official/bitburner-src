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
  AcceptInvestmentOffer,
  BuyBackShares,
  GoPublic,
  IssueNewShares,
  SellShares,
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
            expect(calculateUpgradeCost(corporation, upgrade, targetUpgradeLevel as PositiveInteger)).toMatchSnapshot(
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
            const calculatedCost = calculateUpgradeCost(corporation, upgrade, targetUpgradeLevel as PositiveInteger);
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
      expectSharesToAddUp(Player.corporation!);
    });
    it("should be preserved by acceptInvestmentOffer", () => {
      AcceptInvestmentOffer(corporation);
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by goPublic", () => {
      const numShares = 1e8;
      GoPublic(corporation, numShares);
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by IssueNewShares", () => {
      const numShares = 1e8;
      GoPublic(corporation, numShares);
      corporation.issueNewSharesCooldown = 0;
      IssueNewShares(corporation, numShares);
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by BuyBackShares", () => {
      const numShares = 1e8;
      GoPublic(corporation, numShares);
      BuyBackShares(corporation, numShares);
      expectSharesToAddUp(corporation);
    });
    it("should be preserved by SellShares", () => {
      const numShares = 1e8;
      GoPublic(corporation, numShares);
      corporation.shareSaleCooldown = 0;
      SellShares(corporation, numShares);
      expectSharesToAddUp(corporation);
    });
  });

  describe("helpers.calculateOfficeSizeUpgradeCost", () => {
    // These values were pulled from v2.6.0 as reference test values
    const refCosts = {
      from3: {
        3: 4360000000,
        15: 26093338259.60001,
        150: 3553764305895.2593,
      },
      from6: {
        3: 4752400000.000001,
        15: 28441738702.964012,
        150: 3873603093425.833,
      },
      from9: {
        3: 5180116000.000002,
        15: 31001495186.230778,
        150: 4222227371834.1587,
      },
    };

    describe("upgrade office size from size 3", () => {
      it("should be correct when upgrading from 3->6", () => {
        expect(calculateOfficeSizeUpgradeCost(3, 3)).toBeCloseTo(refCosts.from3[3], 1);
      });
      it("should be correct when upgrading from 3->18", () => {
        expect(calculateOfficeSizeUpgradeCost(3, 15)).toBeCloseTo(refCosts.from3[15], 1);
      });
      it("should be correct when upgrading from 3->153", () => {
        expect(calculateOfficeSizeUpgradeCost(3, 150)).toBeCloseTo(refCosts.from3[150], 1);
      });
    });
    describe("upgrade office size from size 6", () => {
      it("should be correct when upgrading from 6->9", () => {
        expect(calculateOfficeSizeUpgradeCost(6, 3)).toBeCloseTo(refCosts.from6[3], 1);
      });
      it("should be correct when upgrading from 6->21", () => {
        expect(calculateOfficeSizeUpgradeCost(6, 15)).toBeCloseTo(refCosts.from6[15], 1);
      });
      it("should be correct when upgrading from 6->156", () => {
        expect(calculateOfficeSizeUpgradeCost(6, 150)).toBeCloseTo(refCosts.from6[150], 1);
      });
    });
    describe("upgrade office size from size 9", () => {
      it("should be correct when upgrading from 9->12", () => {
        expect(calculateOfficeSizeUpgradeCost(9, 3)).toBeCloseTo(refCosts.from9[3], 1);
      });
      it("should be correct when upgrading from 9->24", () => {
        expect(calculateOfficeSizeUpgradeCost(9, 15)).toBeCloseTo(refCosts.from9[15], 1);
      });
      it("should be correct when upgrading from 9->159", () => {
        expect(calculateOfficeSizeUpgradeCost(9, 150)).toBeCloseTo(refCosts.from9[150], 1);
      });
    });
  });
});
