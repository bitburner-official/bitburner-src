import { HacknetNodeConstants, HacknetServerConstants } from "../../src/Hacknet/data/Constants";
import {
  calculateCoreUpgradeCost as calculateCoreUpgradeCostNode,
  calculateLevelUpgradeCost as calculateLevelUpgradeCostNode,
  calculateRamUpgradeCost as calculateRamUpgradeCostNode,
} from "../../src/Hacknet/formulas/HacknetNodes";
import {
  calculateCoreUpgradeCost as calculateCoreUpgradeCostServer,
  calculateLevelUpgradeCost as calculateLevelUpgradeCostServer,
  calculateRamUpgradeCost as calculateRamUpgradeCostServer,
} from "../../src/Hacknet/formulas/HacknetServers";

describe("HacknetNode calculations", () => {
  describe("calculateLevelUpgradeCost applies limits", () => {
    it("bails out for NaN", () => {
      expect(calculateLevelUpgradeCostNode(1, NaN, 1)).toBe(0);
    });
    it("fails for invalid extraLevels", () => {
      expect(calculateLevelUpgradeCostNode(1, -1, 1)).toBe(0);
      expect(calculateLevelUpgradeCostNode(1, 0, 1)).toBe(0);
      expect(calculateLevelUpgradeCostNode(1, 1, 1)).toBeGreaterThan(0);
    });
    it("correctly rounds values between 0.5 and 1", () => {
      expect(calculateLevelUpgradeCostNode(1, 0.4, 1)).toBe(0);
      expect(calculateLevelUpgradeCostNode(1, 0.5, 1)).toBeGreaterThan(0);
      expect(calculateLevelUpgradeCostNode(1, 0.9999999999999999, 1)).toBeGreaterThan(0);
    });
    it("limits maximum level correctly", () => {
      expect(calculateLevelUpgradeCostNode(HacknetNodeConstants.MaxLevel, 1, 1)).toBe(Infinity);
      expect(calculateLevelUpgradeCostNode(HacknetNodeConstants.MaxLevel + 1, 1, 1)).toBe(Infinity);
      expect(calculateLevelUpgradeCostNode(HacknetNodeConstants.MaxLevel - 1, 1, 1)).toBeGreaterThan(0);
      expect(calculateLevelUpgradeCostNode(HacknetNodeConstants.MaxLevel - 2, 5, 1)).toBe(Infinity);
    });
  });

  describe("calculateRamUpgradeCost applies limits", () => {
    it("bails out for NaN", () => {
      expect(calculateRamUpgradeCostNode(1, NaN, 1)).toBe(0);
    });
    it("fails for invalid extraLevels", () => {
      expect(calculateRamUpgradeCostNode(1, -1, 1)).toBe(0);
      expect(calculateRamUpgradeCostNode(1, 0, 1)).toBe(0);
      expect(calculateRamUpgradeCostNode(1, 1, 1)).toBeGreaterThan(0);
    });
    it("correctly rounds values between 0.5 and 1", () => {
      expect(calculateRamUpgradeCostNode(1, 0.4, 1)).toBe(0);
      expect(calculateRamUpgradeCostNode(1, 0.5, 1)).toBeGreaterThan(0);
      expect(calculateRamUpgradeCostNode(1, 0.9999999999999999, 1)).toBeGreaterThan(0);
    });
    it("limits maximum level correctly", () => {
      expect(calculateRamUpgradeCostNode(HacknetNodeConstants.MaxRam, 1, 1)).toBe(Infinity);
      expect(calculateRamUpgradeCostNode(HacknetNodeConstants.MaxRam + 1, 1, 1)).toBe(Infinity);
      expect(calculateRamUpgradeCostNode(HacknetNodeConstants.MaxRam - 1, 1, 1)).toBeGreaterThan(0);
      expect(calculateRamUpgradeCostNode(HacknetNodeConstants.MaxRam - 2, 5, 1)).toBe(Infinity);
    });
  });

  describe("calculateCoreUpgradeCost applies limits", () => {
    it("bails out for NaN", () => {
      expect(calculateCoreUpgradeCostNode(1, NaN, 1)).toBe(0);
    });
    it("fails for invalid extraLevels", () => {
      expect(calculateCoreUpgradeCostNode(1, -1, 1)).toBe(0);
      expect(calculateCoreUpgradeCostNode(1, 0, 1)).toBe(0);
      expect(calculateCoreUpgradeCostNode(1, 1, 1)).toBeGreaterThan(0);
    });
    it("correctly rounds values between 0.5 and 1", () => {
      expect(calculateCoreUpgradeCostNode(1, 0.4, 1)).toBe(0);
      expect(calculateCoreUpgradeCostNode(1, 0.5, 1)).toBeGreaterThan(0);
      expect(calculateCoreUpgradeCostNode(1, 0.9999999999999999, 1)).toBeGreaterThan(0);
    });
    it("limits maximum level correctly", () => {
      expect(calculateCoreUpgradeCostNode(HacknetNodeConstants.MaxCores, 1, 1)).toBe(Infinity);
      expect(calculateCoreUpgradeCostNode(HacknetNodeConstants.MaxCores + 1, 1, 1)).toBe(Infinity);
      expect(calculateCoreUpgradeCostNode(HacknetNodeConstants.MaxCores - 1, 1, 1)).toBeGreaterThan(0);
      expect(calculateCoreUpgradeCostNode(HacknetNodeConstants.MaxCores - 2, 5, 1)).toBe(Infinity);
    });
  });
});

describe("HacknetServer calculations", () => {
  describe("calculateLevelUpgradeCost applies limits", () => {
    it("bails out for NaN", () => {
      expect(calculateLevelUpgradeCostServer(1, NaN, 1)).toBe(0);
    });
    it("fails for invalid extraLevels", () => {
      expect(calculateLevelUpgradeCostServer(1, -1, 1)).toBe(0);
      expect(calculateLevelUpgradeCostServer(1, 0, 1)).toBe(0);
      expect(calculateLevelUpgradeCostServer(1, 1, 1)).toBeGreaterThan(0);
    });
    it("correctly rounds values between 0.5 and 1", () => {
      expect(calculateLevelUpgradeCostServer(1, 0.4, 1)).toBe(0);
      expect(calculateLevelUpgradeCostServer(1, 0.5, 1)).toBeGreaterThan(0);
      expect(calculateLevelUpgradeCostServer(1, 0.9999999999999999, 1)).toBeGreaterThan(0);
    });
    it("limits maximum level correctly", () => {
      expect(calculateLevelUpgradeCostServer(HacknetServerConstants.MaxLevel, 1, 1)).toBe(Infinity);
      expect(calculateLevelUpgradeCostServer(HacknetServerConstants.MaxLevel + 1, 1, 1)).toBe(Infinity);
      expect(calculateLevelUpgradeCostServer(HacknetServerConstants.MaxLevel - 1, 1, 1)).toBeGreaterThan(0);
      expect(calculateLevelUpgradeCostServer(HacknetServerConstants.MaxLevel - 2, 5, 1)).toBe(Infinity);
    });
  });

  describe("calculateRamUpgradeCost applies limits", () => {
    it("bails out for NaN", () => {
      expect(calculateRamUpgradeCostServer(1, NaN, 1)).toBe(0);
    });
    it("fails for invalid extraLevels", () => {
      expect(calculateRamUpgradeCostServer(1, -1, 1)).toBe(0);
      expect(calculateRamUpgradeCostServer(1, 0, 1)).toBe(0);
      expect(calculateRamUpgradeCostServer(1, 1, 1)).toBeGreaterThan(0);
    });
    it("correctly rounds values between 0.5 and 1", () => {
      expect(calculateRamUpgradeCostServer(1, 0.4, 1)).toBe(0);
      expect(calculateRamUpgradeCostServer(1, 0.5, 1)).toBeGreaterThan(0);
      expect(calculateRamUpgradeCostServer(1, 0.9999999999999999, 1)).toBeGreaterThan(0);
    });
    it("limits maximum level correctly", () => {
      expect(calculateRamUpgradeCostServer(HacknetServerConstants.MaxRam, 1, 1)).toBe(Infinity);
      expect(calculateRamUpgradeCostServer(HacknetServerConstants.MaxRam + 1, 1, 1)).toBe(Infinity);
      expect(calculateRamUpgradeCostServer(HacknetServerConstants.MaxRam - 1, 1, 1)).toBeGreaterThan(0);
      expect(calculateRamUpgradeCostServer(HacknetServerConstants.MaxRam - 2, 5, 1)).toBe(Infinity);
    });
  });

  describe("calculateCoreUpgradeCost applies limits", () => {
    it("bails out for NaN", () => {
      expect(calculateCoreUpgradeCostServer(1, NaN, 1)).toBe(0);
    });
    it("fails for invalid extraLevels", () => {
      expect(calculateCoreUpgradeCostServer(1, -1, 1)).toBe(0);
      expect(calculateCoreUpgradeCostServer(1, 0, 1)).toBe(0);
      expect(calculateCoreUpgradeCostServer(1, 1, 1)).toBeGreaterThan(0);
    });
    it("correctly rounds values between 0.5 and 1", () => {
      expect(calculateCoreUpgradeCostServer(1, 0.4, 1)).toBe(0);
      expect(calculateCoreUpgradeCostServer(1, 0.5, 1)).toBeGreaterThan(0);
      expect(calculateCoreUpgradeCostServer(1, 0.9999999999999999, 1)).toBeGreaterThan(0);
    });
    it("limits maximum level correctly", () => {
      expect(calculateCoreUpgradeCostServer(HacknetServerConstants.MaxCores, 1, 1)).toBe(Infinity);
      expect(calculateCoreUpgradeCostServer(HacknetServerConstants.MaxCores + 1, 1, 1)).toBe(Infinity);
      expect(calculateCoreUpgradeCostServer(HacknetServerConstants.MaxCores - 1, 1, 1)).toBeGreaterThan(0);
      expect(calculateCoreUpgradeCostServer(HacknetServerConstants.MaxCores - 2, 5, 1)).toBe(Infinity);
    });
  });
});
