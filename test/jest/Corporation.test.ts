import { PositiveInteger } from "../../src/types";
import { Corporation } from "../../src/Corporation/Corporation";
import { Division } from "../../src/Corporation/Division";
import { Warehouse } from "../../src/Corporation/Warehouse";
import { Material } from "../../src/Corporation/Material";
import { OfficeSpace } from "../../src/Corporation/OfficeSpace";
import { CorpUpgrades } from "../../src/Corporation/data/CorporationUpgrades";
import { CorpUnlockName, CorpEmployeeJob } from "@enums";
import * as corpConstants from "../../src/Corporation/data/Constants";
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
  goPublic,
  issueNewShares,
  sellShares,
  makeProduct,
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
});

describe("Division", () => {
  let corporation: Corporation;
  let divisionChem: Division;
  let divisionMining: Division;
  let divisionComputer: Division;

  const city = "Sector-12";
  const name = "ChemTestDiv";
  var cyclesNeeded = 0;

  function setupCorporation() {
    setPlayer(new PlayerObject());
    Player.init();
    const corporation = new Corporation({ name: "Test" });

    corporation.divisions.set(
      "ChemTestDiv",
      new Division({
        corp: corporation,
        name: "ChemTestDiv",
        type: "Chemical",
      }),
    );

    corporation.divisions.set(
      "MiningTestDiv",
      new Division({
        corp: corporation,
        name: "MiningTestDiv",
        type: "Mining",
      }),
    );

    corporation.divisions.set(
      "ComputerTestDiv",
      new Division({
        corp: corporation,
        name: "ComputerTestDiv",
        type: "Computer Hardware",
      }),
    );

    corporation.unlocks.add(CorpUnlockName.SmartSupply);
    return corporation;
  }

  function setupWarehouse(division: Division, city: string, corporation: Corporation) {
    const warehouse = new Warehouse({ division, loc: city, size: 1 });
    warehouse.level = 1;
    warehouse.updateSize(corporation, division);
    warehouse.materials["Food"].stored = 333.33 * 5; // Fill half with filler material, so that free Warehouse space is 50
    warehouse.updateSize(corporation, division);
    warehouse.updateMaterialSizeUsed();
    warehouse.smartSupplyEnabled = true;
    warehouse.smartSupplyOptions["Plants"] = "leftovers";
    warehouse.smartSupplyOptions["Water"] = "leftovers";
    warehouse.smartSupplyOptions["Hardware"] = "leftovers";
    division.warehouses[city] = warehouse;
  }

  beforeAll(() => {
    corporation = setupCorporation();
    divisionChem = corporation.divisions.get("ChemTestDiv")!;
    divisionMining = corporation.divisions.get("MiningTestDiv")!;
    divisionComputer = corporation.divisions.get("ComputerTestDiv")!;

    // Improve Productivity to fill the warehouse faster
    for (const div of [divisionChem, divisionMining, divisionComputer]) {
      const office = div.offices[city]!;
      const osize = 2e6;
      office.size = osize;
      for (let i = 0; i < osize / 2; i++) {
        office.hireRandomEmployee("Engineer");
        office.hireRandomEmployee("Operations");
      }
      office.calculateEmployeeProductivity(corporation, div);
    }
  });

  beforeEach(() => {
    // Simulate until START phase
    while (corporation.state.nextName != "START") {
      corporation.state.incrementState();
    }

    setupWarehouse(divisionChem, city, corporation);
    setupWarehouse(divisionMining, city, corporation);
    setupWarehouse(divisionComputer, city, corporation);
    divisionComputer.products.clear();
  });

  describe("processMaterials", () => {
    describe("SmartSupply", () => {
      it("should start in START phase and have SmartSupply unlocked", () => {
        expect(corporation.unlocks.has(CorpUnlockName.SmartSupply)).toBe(true);
        expect(corporation.state.nextName).toBe("START");
      });

      it("should prepare warehouses correctly for the Chemical division", () => {
        const warehouse = divisionChem.warehouses[city]!;
        expect(divisionChem.getOfficeProductivity(divisionChem.offices[city]!)).toBeGreaterThan(100);
        expect(divisionChem.requiredMaterials).toStrictEqual({ Plants: 1, Water: 0.5 });
        expect(warehouse.size).toBeCloseTo(100);
        expect(warehouse.sizeUsed).toBeCloseTo(50);
        expect(warehouse.smartSupplyEnabled).toBe(true);
      });

      it("should prepare warehouses correctly for the Mining division", () => {
        const warehouse = divisionMining.warehouses[city]!;
        expect(divisionMining.getOfficeProductivity(divisionMining.offices[city]!)).toBeGreaterThan(100);
        expect(divisionMining.requiredMaterials).toStrictEqual({ Hardware: 0.1 });
        expect(warehouse.size).toBeCloseTo(100);
        expect(warehouse.sizeUsed).toBeCloseTo(50);
        expect(warehouse.smartSupplyEnabled).toBe(true);
      });

      it("should prepare warehouses correctly for the Computer division", () => {
        const warehouse = divisionComputer.warehouses[city]!;
        expect(divisionComputer.getOfficeProductivity(divisionComputer.offices[city]!)).toBeGreaterThan(100);
        expect(divisionComputer.requiredMaterials).toStrictEqual({ Metal: 2 });
        expect(warehouse.size).toBeCloseTo(100);
        expect(warehouse.sizeUsed).toBeCloseTo(50);
        expect(warehouse.smartSupplyEnabled).toBe(true);
      });

      // returns the number of full cycles it took for SmartBuy to act
      function simulateUntilSmartBuyActed(division: Division, maxFullCycles = 3) {
        const warehouse = division.warehouses[city]!;

        // Simulate processing phases until something was bought
        for (let i = 0; i < maxFullCycles; i++) {
          while (corporation.state.nextName != "PURCHASE") {
            expect(isNaN(division.thisCycleExpenses)).toBe(false);
            expect(isNaN(division.thisCycleRevenue)).toBe(false);
            division.process(1, corporation);
            corporation.state.incrementState();
          }

          warehouse.updateMaterialSizeUsed();
          const preWarehouseSize = warehouse.sizeUsed;
          division.process(1, corporation);
          warehouse.updateMaterialSizeUsed();

          if (preWarehouseSize != warehouse.sizeUsed) {
            return i;
          }
          corporation.state.incrementState();
        }
        // SmartBuy did not act
        return -1;
      }

      function prepareWarehouseForTest(warehouse: Warehouse, material: string, amount: number) {
        warehouse.materials[material].stored = amount;
        warehouse.updateMaterialSizeUsed();
      }

      it("should enable SmartBuy in the first cycle", () => {
        let cycles = simulateUntilSmartBuyActed(divisionChem);
        cyclesNeeded = cycles;
        expect(cycles).toBe(0);
      });

      it("should buy maximum amount for the Chemical division when storage is empty", () => {
        const warehouse = divisionChem.warehouses[city]!;
        prepareWarehouseForTest(warehouse, "Plants", 0);
        simulateUntilSmartBuyActed(divisionChem);
        expect(warehouse.sizeUsed).toBeGreaterThan(warehouse.size - 1);
      });

      it("should not buy over production capability", () => {
        const warehouse = divisionChem.warehouses[city]!;
        prepareWarehouseForTest(warehouse, "Food", 0); // empty
        prepareWarehouseForTest(warehouse, "Plants", 0);
        simulateUntilSmartBuyActed(divisionChem);
        expect(warehouse.sizeUsed).toBeLessThan(warehouse.size - 1);
        // Simulate production, export and sell
        corporation.state.incrementState();
        divisionChem.process(1, corporation);
        expect(warehouse.materials["Chemicals"].stored).toBeGreaterThan(0);
        warehouse.materials["Chemicals"].desiredSellAmount = 10000;
        warehouse.materials["Chemicals"].desiredSellPrice = 0;
        corporation.state.incrementState();
        divisionChem.process(1, corporation);
        corporation.state.incrementState();
        divisionChem.process(1, corporation);
        expect(warehouse.materials["Chemicals"].stored).toBe(0);
        expect(warehouse.materials["Plants"].stored).toBeCloseTo(0, 2);
        expect(warehouse.materials["Water"].stored).toBeCloseTo(0, 2);
      });

      it("should buy maximum amount for the Chemical division when storage has 200 units of Plants", () => {
        const warehouse = divisionChem.warehouses[city]!;
        prepareWarehouseForTest(warehouse, "Plants", 200);
        simulateUntilSmartBuyActed(divisionChem);
        expect(warehouse.sizeUsed).toBeGreaterThan(warehouse.size - 1);
      });

      it("should buy maximum amount for the Chemical division when storage has 200 units of Water", () => {
        const warehouse = divisionChem.warehouses[city]!;
        prepareWarehouseForTest(warehouse, "Water", 200);
        simulateUntilSmartBuyActed(divisionChem);
        expect(warehouse.sizeUsed).toBeGreaterThan(warehouse.size - 1);
      });

      it("should buy maximum amount for the Chemical division when storage has 400 units of Plants", () => {
        const warehouse = divisionChem.warehouses[city]!;
        prepareWarehouseForTest(warehouse, "Plants", 400);
        simulateUntilSmartBuyActed(divisionChem);
        expect(warehouse.sizeUsed).toBeGreaterThan(warehouse.size - 1);
      });

      it("should buy maximum amount for the Chemical division when storage has 400 units of Water", () => {
        const warehouse = divisionChem.warehouses[city]!;
        prepareWarehouseForTest(warehouse, "Water", 400);
        simulateUntilSmartBuyActed(divisionChem);
        expect(warehouse.sizeUsed).toBeGreaterThan(warehouse.size - 1);
      });

      it("should not overbuy when product size is larger than base materials", () => {
        const warehouse = divisionMining.warehouses[city]!;
        prepareWarehouseForTest(warehouse, "Food", 3334 * 0.95); // Pre-fill with some food
        expect(warehouse.sizeUsed).toBeGreaterThan(95);

        simulateUntilSmartBuyActed(divisionMining);

        // Estimate that warehouse is not overly full
        // expect(warehouse.sizeUsed).toBeLessThan(96);

        // Simulate production to use up the base material
        corporation.state.incrementState();
        divisionMining.process(1, corporation);

        // Verify that production uses up the warehouse space and base materials
        expect(warehouse.materials["Hardware"].stored).toBeLessThan(0.1);
        expect(warehouse.sizeUsed).toBeCloseTo(100, 1);
      });

      it("should not act when disabled", () => {
        const warehouse = divisionChem.warehouses[city]!;
        warehouse.smartSupplyEnabled = false;
        expect(simulateUntilSmartBuyActed(divisionChem)).toBe(-1);
      });

      it("should not act when no materials are required", () => {
        const warehouse = divisionMining.warehouses[city]!;
        const actualRequiredMaterials = divisionMining.requiredMaterials;
        divisionMining.requiredMaterials = {};
        expect(simulateUntilSmartBuyActed(divisionMining)).toBe(-1);
        divisionMining.requiredMaterials = actualRequiredMaterials;
      });

      it("should not act if production would hinder import", () => {
        const warehouse = divisionMining.warehouses[city]!;
        warehouse.materials["Food"].importAmount = 1e10;
        expect(simulateUntilSmartBuyActed(divisionMining)).toBe(-1);
      });

      it("should not act when enough materials are being imported (set to imports)", () => {
        const warehouse = divisionChem.warehouses[city]!;
        warehouse.smartSupplyOptions["Plants"] = "imports";
        warehouse.smartSupplyOptions["Water"] = "imports";
        warehouse.materials["Food"].stored = 0;
        warehouse.materials["Plants"].importAmount = 1100 / corpConstants.secondsPerMarketCycle;
        warehouse.materials["Water"].importAmount = 550 / corpConstants.secondsPerMarketCycle;
        warehouse.materials["Plants"].stored = 1100;
        warehouse.materials["Water"].stored = 550;
        warehouse.updateMaterialSizeUsed();
        expect(simulateUntilSmartBuyActed(divisionChem)).toBe(-1);
      });

      it("should act when some materials are being imported (set to imports)", () => {
        const warehouse = divisionChem.warehouses[city]!;
        warehouse.smartSupplyOptions["Plants"] = "imports";
        warehouse.smartSupplyOptions["Water"] = "imports";
        warehouse.materials["Food"].stored = 0;
        warehouse.materials["Plants"].importAmount = 1100 / corpConstants.secondsPerMarketCycle / 2;
        warehouse.materials["Water"].importAmount = 550 / corpConstants.secondsPerMarketCycle / 2;
        warehouse.materials["Plants"].stored = 1100 / 2;
        warehouse.materials["Water"].stored = 550 / 2;
        expect(simulateUntilSmartBuyActed(divisionChem)).toBe(cyclesNeeded);
      });

      it("should act when materials are being imported (set to none)", () => {
        const warehouse = divisionChem.warehouses[city]!;
        warehouse.smartSupplyOptions["Plants"] = "none";
        warehouse.smartSupplyOptions["Water"] = "none";
        warehouse.materials["Plants"].importAmount == 1e10;
        warehouse.materials["Water"].importAmount == 1e10;
        expect(simulateUntilSmartBuyActed(divisionChem)).toBe(cyclesNeeded);
      });

      it("should not act when there are enough materials leftover (set to leftovers)", () => {
        const warehouse = divisionChem.warehouses[city]!;
        warehouse.materials["Chemicals"].desiredSellAmount = 10000;
        warehouse.materials["Chemicals"].desiredSellPrice = 0;
        warehouse.smartSupplyOptions["Plants"] = "leftovers";
        warehouse.smartSupplyOptions["Water"] = "leftovers";
        warehouse.materials["Food"].stored = 0;
        simulateUntilSmartBuyActed(divisionChem);
        corporation.state.incrementState();
        divisionComputer.process(1, corporation);
        corporation.state.incrementState();
        divisionComputer.process(1, corporation);
        // now all sold, fill warehouse
        warehouse.materials["Plants"].stored = 1100;
        warehouse.materials["Water"].stored = 550;
        warehouse.updateMaterialSizeUsed();
        expect(warehouse.sizeUsed).toBeGreaterThan(80);
        expect(warehouse.sizeUsed).toBeLessThan(90);

        expect(simulateUntilSmartBuyActed(divisionChem)).toBe(1); // will consume after 1 cycle
      });

      it("should act when there are enough materials leftover (set to none)", () => {
        const warehouse = divisionChem.warehouses[city]!;
        warehouse.smartSupplyOptions["Plants"] = "none";
        warehouse.smartSupplyOptions["Water"] = "none";
        warehouse.materials["Food"].stored = 0;
        warehouse.materials["Plants"].stored = 1100;
        warehouse.materials["Water"].stored = 550;
        warehouse.updateMaterialSizeUsed();
        expect(warehouse.sizeUsed).toBeGreaterThan(80);
        expect(warehouse.sizeUsed).toBeLessThan(90);
        expect(simulateUntilSmartBuyActed(divisionChem)).toBe(cyclesNeeded);
      });

      it("should not act when there is no product and no output material", () => {
        const warehouse = divisionComputer.warehouses[city]!;
        makeProduct(corporation, divisionComputer, city, "Hardware", 1, 1);
        let producedMaterials = divisionComputer.producedMaterials;
        divisionComputer.producedMaterials = [];
        expect(simulateUntilSmartBuyActed(divisionComputer)).toBe(-1);
        divisionComputer.producedMaterials = producedMaterials;
      });

      it("should not act when there is no finished product and no output material", () => {
        const warehouse = divisionComputer.warehouses[city]!;
        makeProduct(corporation, divisionComputer, city, "Hardware", 1, 1);
        let producedMaterials = divisionComputer.producedMaterials;
        divisionComputer.producedMaterials = [];
        expect(divisionComputer.products.has("Hardware")).toBe(true);
        expect(divisionComputer.products.get("Hardware")!.finished).toBe(false);

        expect(simulateUntilSmartBuyActed(divisionComputer)).toBe(-1);
        divisionComputer.producedMaterials = producedMaterials;
      });

      it("should act properly when there is a finished product", () => {
        const warehouse = divisionComputer.warehouses[city]!;
        warehouse.level = 100;
        warehouse.updateSize(corporation, divisionComputer);
        prepareWarehouseForTest(warehouse, "Food", 0); // empty
        makeProduct(corporation, divisionComputer, city, "Hardware", 1, 1);
        expect(divisionComputer.products.has("Hardware")).toBe(true);
        divisionComputer.products.get("Hardware")!.finishProduct(divisionComputer);
        expect(divisionComputer.products.get("Hardware")!.finished).toBe(true);
        expect(simulateUntilSmartBuyActed(divisionComputer)).toBe(cyclesNeeded);
        //expect(warehouse.sizeUsed).toBeGreaterThan(400);
        corporation.state.incrementState();
        divisionComputer.process(1, corporation);
        // check base material is used up
        expect(warehouse.materials["Metal"].stored).toBeLessThan(10); // leave some room for current inefficient production
      });

      it("should act properly when there is a finished product and no output materials", () => {
        const warehouse = divisionComputer.warehouses[city]!;
        warehouse.level = 100;
        warehouse.updateSize(corporation, divisionComputer);
        prepareWarehouseForTest(warehouse, "Food", 0); // empty
        makeProduct(corporation, divisionComputer, city, "Hardware", 1, 1);
        expect(divisionComputer.products.has("Hardware")).toBe(true);
        divisionComputer.products.get("Hardware")!.finishProduct(divisionComputer);
        expect(divisionComputer.products.get("Hardware")!.finished).toBe(true);
        let producedMaterials = divisionComputer.producedMaterials;
        divisionComputer.producedMaterials = [];
        expect(simulateUntilSmartBuyActed(divisionComputer)).toBe(cyclesNeeded);
        corporation.state.incrementState();
        //expect(warehouse.sizeUsed).toBeGreaterThan(200);
        divisionComputer.process(1, corporation);
        // check base material is used up
        expect(warehouse.materials["Metal"].stored).toBeLessThan(10); // leave some room for current inefficient production
        divisionComputer.producedMaterials = producedMaterials;
      });

      it("should act properly when there are multiple finished products", () => {
        const warehouse = divisionComputer.warehouses[city]!;
        warehouse.level = 100;
        warehouse.updateSize(corporation, divisionComputer);
        prepareWarehouseForTest(warehouse, "Food", 0); // empty
        makeProduct(corporation, divisionComputer, city, "Hardware", 1, 1);
        makeProduct(corporation, divisionComputer, city, "Hardware2", 1, 1);
        expect(divisionComputer.products.has("Hardware")).toBe(true);
        expect(divisionComputer.products.has("Hardware2")).toBe(true);
        divisionComputer.products.get("Hardware")!.finishProduct(divisionComputer);
        divisionComputer.products.get("Hardware2")!.finishProduct(divisionComputer);
        expect(divisionComputer.products.get("Hardware")!.finished).toBe(true);
        expect(divisionComputer.products.get("Hardware2")!.finished).toBe(true);
        expect(simulateUntilSmartBuyActed(divisionComputer)).toBe(cyclesNeeded);
        //expect(warehouse.sizeUsed).toBeGreaterThan(600);
        corporation.state.incrementState();
        divisionComputer.process(1, corporation);
        // check base material is used up
        expect(warehouse.materials["Metal"].stored).toBeLessThan(10); // leave some room for current inefficient production
      });
    });
  });
});
