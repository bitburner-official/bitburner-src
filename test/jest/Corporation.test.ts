import { PositiveInteger } from "../../src/types";
import { Corporation } from "../../src/Corporation/Corporation";
import { CorpUpgrades } from "../../src/Corporation/data/CorporationUpgrades";
import {
  calculateMaxAffordableUpgrade,
  calculateUpgradeCost,
  calculateOfficeSizeUpgradeCost,
} from "../../src/Corporation/helpers";
import { Player } from "../../src/Player";
import {
  acceptInvestmentOffer,
  buyBackShares,
  convertAmountString,
  convertPriceString,
  goPublic,
  issueNewShares,
  sellShares,
} from "../../src/Corporation/Actions";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "./Utilities";
import { enterBitNode } from "../../src/RedPill";
import { getDefaultBitNodeOptions } from "../../src/BitNode/BitNodeUtils";
import type { NSFull } from "../../src/NetscriptFunctions";
import { CityName, IndustryType } from "../../src/Enums";
import type { CorpUnlockName } from "@nsdefs";

initGameEnvironment();

let corporation: Corporation;

function getCorp() {
  if (!Player.corporation) {
    throw new Error("Corporation was not initialized");
  }
  return Player.corporation;
}

function getDivision(divisionName: string) {
  const corp = getCorp();
  const division = corp.divisions.get(divisionName);
  if (!division) {
    throw new Error(`Division ${divisionName} does not exist`);
  }
  return division;
}

function getOffice(divisionName: string, city: CityName) {
  const division = getDivision(divisionName);
  const office = division.offices[city];
  if (!office) {
    throw new Error(`Division ${divisionName} has not expanded to ${city}`);
  }
  return office;
}

beforeEach(() => {
  setupBasicTestingEnvironment();
  enterBitNode(true, Player.bitNodeN, 3, getDefaultBitNodeOptions());
  getNS().corporation.createCorporation("Test", false);
  corporation = getCorp();
});

describe("Formulas", () => {
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
});

describe("totalShares", () => {
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

describe("String conversion", () => {
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

function setUpCorp(ns: NSFull, upgrades: CorpUnlockName[]): void {
  const corp = getCorp();
  corp.funds = 1e100;
  corp.storedCycles = 1e10;
  for (const upgrade of upgrades) {
    ns.corporation.purchaseUnlock(upgrade);
  }
}

function setUpDivision(ns: NSFull, divisionName: string): void {
  const division = getDivision(divisionName);
  division.researchPoints = 1e6;
  for (const researchName of ns.corporation.getConstants().researchNamesBase) {
    ns.corporation.research(divisionName, researchName);
  }
  ns.corporation.hireAdVert(divisionName);
  setUpOffice(ns, divisionName, CityName.Sector12);
  for (const materialName of division.producedMaterials) {
    ns.corporation.sellMaterial(divisionName, CityName.Sector12, materialName, "MAX", "MP");
  }
  ns.corporation.upgradeWarehouse(divisionName, CityName.Sector12, 100);
}

function processCycles(numberOfCycles: number) {
  const corp = getCorp();
  for (let i = 0; i < numberOfCycles; ++i) {
    corp.process();
  }
}

function setUpOffice(ns: NSFull, divisionName: string, city: CityName): void {
  ns.corporation.upgradeOfficeSize(divisionName, city, 4000 - 3);
  for (let i = 0; i < 1000; ++i) {
    ns.corporation.hireEmployee(divisionName, city, "Operations");
    ns.corporation.hireEmployee(divisionName, city, "Engineer");
    ns.corporation.hireEmployee(divisionName, city, "Business");
    ns.corporation.hireEmployee(divisionName, city, "Management");
  }
  const office = getOffice(divisionName, city);
  office.avgCharisma = 75;
  office.avgCreativity = 75;
  office.avgEfficiency = 75;
  office.avgIntelligence = 75;
}

describe("production", () => {
  test("limitMaterialProduction 1", () => {
    const ns = getNS();
    setUpCorp(ns, ["Smart Supply"]);
    for (const industry of Object.values(IndustryType)) {
      if (!ns.corporation.getIndustryData(industry).makesMaterials) {
        continue;
      }
      ns.corporation.expandIndustry(industry, industry);
      setUpDivision(ns, industry);
    }
    const corp = getCorp();
    // Process 1 market cycle to purchase input materials.
    processCycles(5);
    expect(corp.getNextState()).toStrictEqual("START");
    processCycles(2);
    expect(corp.getNextState()).toStrictEqual("PRODUCTION");
    processCycles(1);
    for (const division of corp.divisions.values()) {
      for (const city of Object.values(CityName)) {
        const warehouse = division.warehouses[city];
        if (!warehouse) {
          continue;
        }
        for (let i = 0; i < division.producedMaterials.length; ++i) {
          const materialName = division.producedMaterials[i];
          // Without a limit, the production amount should always be higher than this value.
          expect(warehouse.materials[materialName].productionAmount).toBeGreaterThan(10);
          // Set a deterministic production limit.
          const productionLimit = i + 1;
          ns.corporation.limitMaterialProduction(division.name, city, materialName, productionLimit);
          expect(warehouse.materials[materialName].productionLimit).toStrictEqual(productionLimit);
        }
      }
    }
    processCycles(4);
    expect(corp.getNextState()).toStrictEqual("PRODUCTION");
    processCycles(1);
    for (const division of corp.divisions.values()) {
      for (const city of Object.values(CityName)) {
        const warehouse = division.warehouses[city];
        if (!warehouse) {
          continue;
        }
        for (let i = 0; i < division.producedMaterials.length; ++i) {
          const materialName = division.producedMaterials[i];
          // Verify the deterministic production limit.
          const productionLimit = i + 1;
          expect(warehouse.materials[materialName].productionLimit).toStrictEqual(productionLimit);
          // Verify the stored amount.
          // productionLimit is per second, so we need to multiply it with 10. Due to floating-point imprecision, we
          // need to check with toBeCloseTo instead of toStrictEqual.
          expect(warehouse.materials[materialName].stored).toBeCloseTo(productionLimit * 10, 5);
          // Verify the production amount.
          expect(warehouse.materials[materialName].productionAmount).toStrictEqual(productionLimit);
        }
      }
    }
  });
  test("limitMaterialProduction 2", () => {
    const ns = getNS();
    setUpCorp(ns, ["Export"]);
    for (let i = 0; i < 1000; ++i) {
      ns.corporation.levelUpgrade("Smart Storage");
    }
    const corp = getCorp();
    const div1 = "Pharmaceutical";
    const div2 = "Healthcare";
    const city = CityName.Sector12;
    ns.corporation.expandIndustry("Pharmaceutical", div1);
    setUpDivision(ns, div1);
    ns.corporation.sellMaterial(div1, city, "Drugs", "MAX", "MP");
    ns.corporation.limitMaterialProduction(div1, city, "Drugs", 0);
    ns.corporation.expandIndustry("Healthcare", div2);
    ns.corporation.exportMaterial(div1, city, div2, city, "Drugs", "MAX");
    setUpDivision(ns, div2);
    ns.corporation.bulkPurchase(div1, city, "Chemicals", 1e6);
    ns.corporation.bulkPurchase(div1, city, "Water", 1e6);
    ns.corporation.bulkPurchase(div2, city, "Robots", 1e6);
    ns.corporation.bulkPurchase(div2, city, "AI Cores", 1e6);
    ns.corporation.bulkPurchase(div2, city, "Food", 1e6);

    processCycles(5);
    expect(Number.isFinite(ns.corporation.getMaterial(div1, city, "Drugs").quality)).toBe(true);

    ns.corporation.bulkPurchase(div1, city, "Drugs", 1e6);
    ns.corporation.makeProduct(div2, city, "0", 1e10, 1e10);
    ns.corporation.sellProduct(div2, city, "0", "MAX", "MP", true);
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    corp.divisions.get(div2)!.products.get("0")!.developmentProgress = 99.99;
    processCycles(10);

    expect(Number.isFinite(ns.corporation.getMaterial(div1, city, "Drugs").quality)).toBe(true);
    expect(Number.isFinite(ns.corporation.getMaterial(div2, city, "Drugs").quality)).toBe(true);
    expect(Number.isFinite(ns.corporation.getProduct(div2, city, "0").effectiveRating)).toBe(true);
    expect(Number.isFinite(corp.totalAssets)).toBe(true);
  });
});
