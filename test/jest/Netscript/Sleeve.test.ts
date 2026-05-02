import { AugmentationName, FactionName } from "@enums";
import { Player } from "@player";
import { joinFaction } from "../../../src/Faction/FactionHelpers";
import { Factions } from "../../../src/Faction/Factions";
import {
  getSleeveCost,
  MaxSleevesFromCovenant,
  recalculateNumberOfOwnedSleeves,
} from "../../../src/PersonObjects/Sleeve/SleeveCovenantPurchases";
import { getNS, getWorkerScriptAndNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { prestigeSourceFile } from "../../../src/Prestige";

beforeAll(() => {
  initGameEnvironment();
});

describe("Cost", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    Player.bitNodeN = 10;
    Player.sourceFiles.set(10, 0);
    Player.sleevesFromCovenant = 0;
    recalculateNumberOfOwnedSleeves();
  });
  test("getSleeveCost", () => {
    // Invalid values
    expect(getSleeveCost(-1)).toStrictEqual(Infinity);
    expect(getSleeveCost(1.5)).toStrictEqual(Infinity);
    expect(getSleeveCost(5)).toStrictEqual(Infinity);
    expect(getSleeveCost(Infinity)).toStrictEqual(Infinity);
    expect(getSleeveCost(NaN)).toStrictEqual(Infinity);

    // Valid values
    expect(getSleeveCost(0)).toStrictEqual(10e12);
    expect(getSleeveCost(1)).toStrictEqual(100e12);
    expect(getSleeveCost(2)).toStrictEqual(1e15);
    expect(getSleeveCost(3)).toStrictEqual(10e15);
    expect(getSleeveCost(4)).toStrictEqual(100e15);
  });
  test("getMemoryUpgradeCost", () => {
    // Invalid values
    Player.sleeves[0].memory = 1;
    expect(Player.sleeves[0].getMemoryUpgradeCost(-1)).toStrictEqual(Infinity);
    expect(Player.sleeves[0].getMemoryUpgradeCost(1.5)).toStrictEqual(Infinity);
    expect(Player.sleeves[0].getMemoryUpgradeCost(100)).toStrictEqual(Infinity);
    expect(Player.sleeves[0].getMemoryUpgradeCost(Infinity)).toStrictEqual(Infinity);
    expect(Player.sleeves[0].getMemoryUpgradeCost(NaN)).toStrictEqual(Infinity);

    // Valid values
    Player.sleeves[0].memory = 1;
    expect(Player.sleeves[0].getMemoryUpgradeCost(0)).toStrictEqual(0);
    expect(Player.sleeves[0].getMemoryUpgradeCost(1)).toStrictEqual(1e12);
    expect(Player.sleeves[0].getMemoryUpgradeCost(10)).toStrictEqual(1.0949720999737857e13);
    expect(Player.sleeves[0].getMemoryUpgradeCost(99)).toStrictEqual(3.051297116790364e14);
    Player.sleeves[0].memory = 50;
    expect(Player.sleeves[0].getMemoryUpgradeCost(0)).toStrictEqual(0);
    expect(Player.sleeves[0].getMemoryUpgradeCost(1)).toStrictEqual(2.6388117932094194e12);
    expect(Player.sleeves[0].getMemoryUpgradeCost(10)).toStrictEqual(2.889425290646109e13);
    expect(Player.sleeves[0].getMemoryUpgradeCost(50)).toStrictEqual(2.231891220185655e14);
  });
});

describe("Success", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    Player.bitNodeN = 10;
    Player.sourceFiles.set(10, 0);
    Player.sleevesFromCovenant = 0;
    recalculateNumberOfOwnedSleeves();
    joinFaction(Factions[FactionName.TheCovenant]);
  });
  test("purchaseSleeve", () => {
    const ns = getNS();
    for (let i = 0; i < 5; ++i) {
      Player.money = getSleeveCost(Player.sleevesFromCovenant);
      expect(Player.sleevesFromCovenant).toStrictEqual(i);
      expect(ns.sleeve.getNumSleeves()).toStrictEqual(i + 1);
      expect(ns.sleeve.purchaseSleeve().success).toStrictEqual(true);
      expect(Player.sleevesFromCovenant).toStrictEqual(i + 1);
      expect(ns.sleeve.getNumSleeves()).toStrictEqual(i + 2);
      expect(Player.money).toStrictEqual(0);
    }
  });
  test("upgradeMemory", () => {
    const ns = getNS();
    const sleeve = Player.sleeves[0];
    // Upgrade memory from 1 to 100 gradually
    sleeve.memory = 1;
    for (let i = 0; i < 99; ++i) {
      Player.money = sleeve.getMemoryUpgradeCost(1);
      expect(sleeve.memory).toStrictEqual(i + 1);
      expect(ns.sleeve.upgradeMemory(0, 1).success).toStrictEqual(true);
      expect(sleeve.memory).toStrictEqual(i + 2);
      expect(Player.money).toStrictEqual(0);
    }
    // Upgrade memory from 1 to 100 immediately
    sleeve.memory = 1;
    Player.money = sleeve.getMemoryUpgradeCost(99);
    expect(ns.sleeve.upgradeMemory(0, 99).success).toStrictEqual(true);
    expect(sleeve.memory).toStrictEqual(100);
    expect(Player.money).toStrictEqual(0);
  });
  test("purchaseSleeveAug", () => {
    const ns = getNS();
    const augName = AugmentationName.BitWire;
    Player.sleeves[0].shock = 0;
    // CyberSec offers BitWire.
    joinFaction(Factions.CyberSec);
    Factions.CyberSec.playerReputation = 1e10;
    expect(ns.sleeve.purchaseSleeveAug(0, augName)).toStrictEqual(true);
  });
});

describe("Failure", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    // Set BN to anything that is not BN10, then bitflume.
    Player.bitNodeN = 1;
    prestigeSourceFile(true);
  });
  test("purchaseSleeve", () => {
    const ns = getNS();

    // Not in BN10
    expect(() => ns.sleeve.purchaseSleeve()).toThrow("You must be in BitNode 10");

    let result;
    // Not a member of The Covenant
    Player.bitNodeN = 10;
    Player.sourceFiles.set(10, 0);
    Player.sleevesFromCovenant = 0;
    recalculateNumberOfOwnedSleeves();
    result = ns.sleeve.purchaseSleeve();
    expect(result.success).toStrictEqual(false);
    expect(result.message).toContain("You must be a member of");

    // Have max number of purchasable sleeves
    joinFaction(Factions[FactionName.TheCovenant]);
    Player.sleevesFromCovenant = MaxSleevesFromCovenant;
    recalculateNumberOfOwnedSleeves();
    result = ns.sleeve.purchaseSleeve();
    expect(result.success).toStrictEqual(false);
    expect(result.message).toContain("You already have the maximum amount of sleeves");

    // Not enough money
    Player.sleevesFromCovenant = 0;
    recalculateNumberOfOwnedSleeves();
    Player.money = 0;
    result = ns.sleeve.purchaseSleeve();
    expect(result.success).toStrictEqual(false);
    expect(result.message).toContain("You must have at least");
  });
  test("purchaseSleeve", () => {
    const ns = getNS();

    // Not in BN10
    expect(() => ns.sleeve.upgradeMemory(0, 1)).toThrow("You must be in BitNode 10");

    let result;
    // Not a member of The Covenant
    Player.bitNodeN = 10;
    Player.sourceFiles.set(10, 0);
    Player.sleevesFromCovenant = 0;
    recalculateNumberOfOwnedSleeves();
    result = ns.sleeve.upgradeMemory(0, 1);
    expect(result.success).toStrictEqual(false);
    expect(result.message).toContain("You must be a member of");

    // Purchase too many upgrades
    joinFaction(Factions[FactionName.TheCovenant]);
    result = ns.sleeve.upgradeMemory(0, 100);
    expect(result.success).toStrictEqual(false);
    expect(result.message).toContain("Invalid amount of upgrade");

    // Not enough money
    Player.money = 0;
    result = ns.sleeve.upgradeMemory(0, 1);
    expect(result.success).toStrictEqual(false);
    expect(result.message).toContain("You must have at least");
  });

  test("purchaseSleeveAug", () => {
    // Set BN10 and recalculate to get the first sleeve.
    Player.bitNodeN = 10;
    recalculateNumberOfOwnedSleeves();
    const { ws, ns } = getWorkerScriptAndNS();
    const augName = AugmentationName.BitWire;

    // disableSleeveExpAndAugmentation = true
    Player.bitNodeOptions.disableSleeveExpAndAugmentation = true;
    expect(ns.sleeve.purchaseSleeveAug(0, augName)).toStrictEqual(false);
    expect(ws.scriptRef.logs[0]).toMatch(`The "Disable Sleeves' experience and augmentation" option was enabled`);

    // shock > 0
    Player.bitNodeOptions.disableSleeveExpAndAugmentation = false;
    expect(ns.sleeve.purchaseSleeveAug(0, augName)).toStrictEqual(false);
    expect(ws.scriptRef.logs[1]).toMatch("You must reduce the sleeve shock to 0");

    // Not enough money
    Player.sleeves[0].shock = 0;
    Player.money = 0;
    expect(ns.sleeve.purchaseSleeveAug(0, augName)).toStrictEqual(false);
    expect(ws.scriptRef.logs[2]).toMatch("You must have at least");

    // Already have the augmentation
    Player.money = 1e15;
    Player.sleeves[0].augmentations.push({ name: augName, level: 1 });
    expect(ns.sleeve.purchaseSleeveAug(0, augName)).toStrictEqual(false);
    expect(ws.scriptRef.logs[3]).toMatch(`This sleeve already has "${augName}" augmentation`);

    // Non-purchasable augmentation
    Player.sleeves[0].augmentations = [];
    expect(ns.sleeve.purchaseSleeveAug(0, augName)).toStrictEqual(false);
    expect(ws.scriptRef.logs[4]).toMatch(`"${augName}" is not in the list of purchasable augmentations`);
  });
});
