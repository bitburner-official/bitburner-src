/**
 * Generic helper/utility functions for the Hacknet mechanic:
 *  - Purchase nodes/upgrades
 *  - Calculating maximum number of upgrades
 *  - Processing Hacknet earnings
 *  - Updating Hash Manager capacity
 *  - Purchasing hash upgrades
 *
 * TODO unplanned Should probably split the different types of functions into their own modules
 */
import { HacknetNode } from "./HacknetNode";
import { calculateNodeCost } from "./formulas/HacknetNodes";
import { calculateServerCost } from "./formulas/HacknetServers";
import { HacknetNodeConstants, HacknetServerConstants } from "./data/Constants";
import { HacknetServer } from "./HacknetServer";
import { HashManager } from "./HashManager";
import { HashUpgrades } from "./HashUpgrades";

import { generateRandomContract } from "../CodingContract/ContractGenerator";
import { iTutorialSteps, iTutorialNextStep, ITutorial } from "../InteractiveTutorial";
import { Player } from "@player";
import { GetServer } from "../Server/AllServers";
import { Server } from "../Server/Server";
import { Companies } from "../Company/Companies";
import { isMember } from "../utils/EnumHelper";
import { canAccessBitNodeFeature } from "../BitNode/BitNodeUtils";
import { checkServerOwnership, ServerOwnershipType } from "../Server/ServerHelpers";
import { Result } from "../types";
import { exceptionAlert } from "../utils/helpers/exceptionAlert";
import { HashUpgradeEnum } from "./Enums";

// Returns a boolean indicating whether the player has Hacknet Servers
// (the upgraded form of Hacknet Nodes)
export function hasHacknetServers(): boolean {
  return canAccessBitNodeFeature(9) && !Player.bitNodeOptions.disableHacknetServer;
}

export function purchaseHacknet(): number {
  /* INTERACTIVE TUTORIAL */
  if (ITutorial.isRunning) {
    if (ITutorial.currStep === iTutorialSteps.HacknetNodesIntroduction) {
      iTutorialNextStep();
    } else {
      return -1;
    }
  }
  /* END INTERACTIVE TUTORIAL */

  const numOwned = Player.hacknetNodes.length;
  if (hasHacknetServers()) {
    const cost = getCostOfNextHacknetServer();
    if (isNaN(cost)) {
      throw new Error(`Calculated cost of purchasing HacknetServer is NaN`);
    }

    if (!Player.canAfford(cost) || numOwned >= HacknetServerConstants.MaxServers) {
      return -1;
    }
    Player.loseMoney(cost, "hacknet_expenses");
    Player.createHacknetServer();
    updateHashManagerCapacity();

    return numOwned;
  } else {
    const cost = getCostOfNextHacknetNode();
    if (isNaN(cost)) {
      throw new Error(`Calculated cost of purchasing HacknetNode is NaN`);
    }

    if (!Player.canAfford(cost)) {
      return -1;
    }

    // Auto generate a name for the Node
    const name = hasHacknetServers() ? `hacknet-server-${numOwned}` : `hacknet-node-${numOwned}`;
    const node = new HacknetNode(name, Player.mults.hacknet_node_money);

    Player.loseMoney(cost, "hacknet_expenses");
    Player.hacknetNodes.push(node);

    return numOwned;
  }
}

export function hasMaxNumberHacknetServers(): boolean {
  return hasHacknetServers() && Player.hacknetNodes.length >= HacknetServerConstants.MaxServers;
}

export function getCostOfNextHacknetNode(): number {
  return calculateNodeCost(Player.hacknetNodes.length + 1, Player.mults.hacknet_node_purchase_cost);
}

export function getCostOfNextHacknetServer(): number {
  return calculateServerCost(Player.hacknetNodes.length + 1, Player.mults.hacknet_node_purchase_cost);
}

// Calculate the maximum number of times the Player can afford to upgrade a Hacknet Node's level
export function getMaxNumberLevelUpgrades(nodeObj: HacknetNode | HacknetServer, maxLevel: number): number {
  if (maxLevel == null) {
    throw new Error(`getMaxNumberLevelUpgrades() called without maxLevel arg`);
  }

  if (Player.money < nodeObj.calculateLevelUpgradeCost(1, Player.mults.hacknet_node_level_cost)) {
    return 0;
  }

  let min = 1;
  let max = maxLevel - 1;
  const levelsToMax = maxLevel - nodeObj.level;
  if (Player.money >= nodeObj.calculateLevelUpgradeCost(levelsToMax, Player.mults.hacknet_node_level_cost)) {
    return levelsToMax;
  }

  while (min <= max) {
    const curr = ((min + max) / 2) | 0;
    if (
      curr !== maxLevel &&
      Player.money > nodeObj.calculateLevelUpgradeCost(curr, Player.mults.hacknet_node_level_cost) &&
      Player.money < nodeObj.calculateLevelUpgradeCost(curr + 1, Player.mults.hacknet_node_level_cost)
    ) {
      return Math.min(levelsToMax, curr);
    } else if (Player.money < nodeObj.calculateLevelUpgradeCost(curr, Player.mults.hacknet_node_level_cost)) {
      max = curr - 1;
    } else if (Player.money > nodeObj.calculateLevelUpgradeCost(curr, Player.mults.hacknet_node_level_cost)) {
      min = curr + 1;
    } else {
      return Math.min(levelsToMax, curr);
    }
  }
  return 0;
}

// Calculate the maximum number of times the Player can afford to upgrade a Hacknet Node's RAM
export function getMaxNumberRamUpgrades(nodeObj: HacknetNode | HacknetServer, maxLevel: number): number {
  if (maxLevel == null) {
    throw new Error(`getMaxNumberRamUpgrades() called without maxLevel arg`);
  }

  if (Player.money < nodeObj.calculateRamUpgradeCost(1, Player.mults.hacknet_node_ram_cost)) {
    return 0;
  }

  let levelsToMax;
  if (nodeObj instanceof HacknetServer) {
    levelsToMax = Math.round(Math.log2(maxLevel / nodeObj.maxRam));
  } else {
    levelsToMax = Math.round(Math.log2(maxLevel / nodeObj.ram));
  }
  if (Player.money >= nodeObj.calculateRamUpgradeCost(levelsToMax, Player.mults.hacknet_node_ram_cost)) {
    return levelsToMax;
  }

  //We'll just loop until we find the max
  for (let i = levelsToMax - 1; i >= 0; --i) {
    if (Player.money >= nodeObj.calculateRamUpgradeCost(i, Player.mults.hacknet_node_ram_cost)) {
      return i;
    }
  }
  return 0;
}

// Calculate the maximum number of times the Player can afford to upgrade a Hacknet Node's cores
export function getMaxNumberCoreUpgrades(nodeObj: HacknetNode | HacknetServer, maxLevel: number): number {
  if (maxLevel == null) {
    throw new Error(`getMaxNumberCoreUpgrades() called without maxLevel arg`);
  }

  if (Player.money < nodeObj.calculateCoreUpgradeCost(1, Player.mults.hacknet_node_core_cost)) {
    return 0;
  }

  let min = 1;
  let max = maxLevel - 1;
  const levelsToMax = maxLevel - nodeObj.cores;
  if (Player.money >= nodeObj.calculateCoreUpgradeCost(levelsToMax, Player.mults.hacknet_node_core_cost)) {
    return levelsToMax;
  }

  // Use a binary search to find the max possible number of upgrades
  while (min <= max) {
    const curr = ((min + max) / 2) | 0;
    if (
      curr != maxLevel &&
      Player.money > nodeObj.calculateCoreUpgradeCost(curr, Player.mults.hacknet_node_core_cost) &&
      Player.money < nodeObj.calculateCoreUpgradeCost(curr + 1, Player.mults.hacknet_node_core_cost)
    ) {
      return Math.min(levelsToMax, curr);
    } else if (Player.money < nodeObj.calculateCoreUpgradeCost(curr, Player.mults.hacknet_node_core_cost)) {
      max = curr - 1;
    } else if (Player.money > nodeObj.calculateCoreUpgradeCost(curr, Player.mults.hacknet_node_core_cost)) {
      min = curr + 1;
    } else {
      return Math.min(levelsToMax, curr);
    }
  }

  return 0;
}

// Calculate the maximum number of times the Player can afford to upgrade a Hacknet Node's cache
export function getMaxNumberCacheUpgrades(nodeObj: HacknetServer, maxLevel: number): number {
  if (maxLevel == null) {
    throw new Error(`getMaxNumberCacheUpgrades() called without maxLevel arg`);
  }

  if (!Player.canAfford(nodeObj.calculateCacheUpgradeCost(1))) {
    return 0;
  }

  let min = 1;
  let max = maxLevel - 1;
  const levelsToMax = maxLevel - nodeObj.cache;
  if (Player.canAfford(nodeObj.calculateCacheUpgradeCost(levelsToMax))) {
    return levelsToMax;
  }

  // Use a binary search to find the max possible number of upgrades
  while (min <= max) {
    const curr = ((min + max) / 2) | 0;
    if (
      curr != maxLevel &&
      Player.canAfford(nodeObj.calculateCacheUpgradeCost(curr)) &&
      !Player.canAfford(nodeObj.calculateCacheUpgradeCost(curr + 1))
    ) {
      return Math.min(levelsToMax, curr);
    } else if (!Player.canAfford(nodeObj.calculateCacheUpgradeCost(curr))) {
      max = curr - 1;
    } else if (Player.canAfford(nodeObj.calculateCacheUpgradeCost(curr))) {
      min = curr + 1;
    } else {
      return Math.min(levelsToMax, curr);
    }
  }

  return 0;
}

export function purchaseLevelUpgrade(node: HacknetNode | HacknetServer, levels = 1): boolean {
  const sanitizedLevels = Math.round(levels);
  const cost = node.calculateLevelUpgradeCost(sanitizedLevels, Player.mults.hacknet_node_level_cost);
  if (isNaN(cost) || cost <= 0 || sanitizedLevels < 0) {
    return false;
  }

  const isServer = node instanceof HacknetServer;

  // If we're at max level, return false
  if (node.level >= (isServer ? HacknetServerConstants.MaxLevel : HacknetNodeConstants.MaxLevel)) {
    return false;
  }

  // If the number of specified upgrades would exceed the max level, calculate
  // the maximum number of upgrades and use that
  if (node.level + sanitizedLevels > (isServer ? HacknetServerConstants.MaxLevel : HacknetNodeConstants.MaxLevel)) {
    const diff = Math.max(0, (isServer ? HacknetServerConstants.MaxLevel : HacknetNodeConstants.MaxLevel) - node.level);
    return purchaseLevelUpgrade(node, diff);
  }

  if (!Player.canAfford(cost)) {
    return false;
  }

  Player.loseMoney(cost, "hacknet_expenses");
  node.upgradeLevel(sanitizedLevels, Player.mults.hacknet_node_money);

  return true;
}

export function purchaseRamUpgrade(node: HacknetNode | HacknetServer, levels = 1): boolean {
  const sanitizedLevels = Math.round(levels);
  const cost = node.calculateRamUpgradeCost(sanitizedLevels, Player.mults.hacknet_node_ram_cost);
  if (isNaN(cost) || cost <= 0 || sanitizedLevels < 0) {
    return false;
  }

  if (node instanceof HacknetServer && node.maxRam >= HacknetServerConstants.MaxRam) {
    return false;
  }

  if (node instanceof HacknetNode && node.ram >= HacknetNodeConstants.MaxRam) {
    return false;
  }

  // If the number of specified upgrades would exceed the max RAM, calculate the
  // max possible number of upgrades and use that
  if (node instanceof HacknetServer) {
    if (node.maxRam * Math.pow(2, sanitizedLevels) > HacknetServerConstants.MaxRam) {
      const diff = Math.max(0, Math.log2(Math.round(HacknetServerConstants.MaxRam / node.maxRam)));
      return purchaseRamUpgrade(node, diff);
    }
  } else if (node instanceof HacknetNode) {
    if (node.ram * Math.pow(2, sanitizedLevels) > HacknetNodeConstants.MaxRam) {
      const diff = Math.max(0, Math.log2(Math.round(HacknetNodeConstants.MaxRam / node.ram)));
      return purchaseRamUpgrade(node, diff);
    }
  }

  if (!Player.canAfford(cost)) {
    return false;
  }

  Player.loseMoney(cost, "hacknet_expenses");
  node.upgradeRam(sanitizedLevels, Player.mults.hacknet_node_money);

  return true;
}

export function purchaseCoreUpgrade(node: HacknetNode | HacknetServer, levels = 1): boolean {
  const sanitizedLevels = Math.round(levels);
  const cost = node.calculateCoreUpgradeCost(sanitizedLevels, Player.mults.hacknet_node_core_cost);
  if (isNaN(cost) || cost <= 0 || sanitizedLevels < 0) {
    return false;
  }

  const isServer = node instanceof HacknetServer;

  // Fail if we're already at max
  if (node.cores >= (isServer ? HacknetServerConstants.MaxCores : HacknetNodeConstants.MaxCores)) {
    return false;
  }

  // If the specified number of upgrades would exceed the max Cores, calculate
  // the max possible number of upgrades and use that
  if (node.cores + sanitizedLevels > (isServer ? HacknetServerConstants.MaxCores : HacknetNodeConstants.MaxCores)) {
    const diff = Math.max(0, (isServer ? HacknetServerConstants.MaxCores : HacknetNodeConstants.MaxCores) - node.cores);
    return purchaseCoreUpgrade(node, diff);
  }

  if (!Player.canAfford(cost)) {
    return false;
  }

  Player.loseMoney(cost, "hacknet_expenses");
  node.upgradeCore(sanitizedLevels, Player.mults.hacknet_node_money);

  return true;
}

export function purchaseCacheUpgrade(node: HacknetServer, levels = 1): boolean {
  const sanitizedLevels = Math.round(levels);
  const cost = node.calculateCacheUpgradeCost(sanitizedLevels);
  if (isNaN(cost) || cost <= 0 || sanitizedLevels < 0) {
    return false;
  }

  if (!(node instanceof HacknetServer)) {
    console.warn(`purchaseCacheUpgrade() called for a non-HacknetNode`);
    return false;
  }

  // Fail if we're already at max
  if (node.cache + sanitizedLevels > HacknetServerConstants.MaxCache) {
    const diff = Math.max(0, HacknetServerConstants.MaxCache - node.cache);
    return purchaseCacheUpgrade(node, diff);
  }

  if (!Player.canAfford(cost)) {
    return false;
  }

  Player.loseMoney(cost, "hacknet_expenses");
  node.upgradeCache(sanitizedLevels);

  return true;
}

export function processHacknetEarnings(numCycles: number): number {
  // Determine if player has Hacknet Nodes or Hacknet Servers, then
  // call the appropriate function
  if (Player.hacknetNodes.length === 0) {
    return 0;
  }
  if (hasHacknetServers()) {
    return processAllHacknetServerEarnings(numCycles);
  } else if (Player.hacknetNodes[0] instanceof HacknetNode) {
    return processAllHacknetNodeEarnings(numCycles);
  } else {
    return 0;
  }
}

function processAllHacknetNodeEarnings(numCycles: number): number {
  let total = 0;
  for (let i = 0; i < Player.hacknetNodes.length; ++i) {
    const node = Player.hacknetNodes[i];
    if (typeof node === "string") throw new Error("player node should not be hostname string");
    node.updateMoneyGainRate(Player.mults.hacknet_node_money);
    total += processSingleHacknetNodeEarnings(numCycles, node);
  }

  return total;
}

function processSingleHacknetNodeEarnings(numCycles: number, nodeObj: HacknetNode): number {
  const totalEarnings = nodeObj.process(numCycles);
  Player.gainMoney(totalEarnings, "hacknet");

  return totalEarnings;
}

function processAllHacknetServerEarnings(numCycles: number): number {
  if (!(Player.hashManager instanceof HashManager)) {
    throw new Error(`Player does not have a HashManager (should be in 'hashManager' prop)`);
  }

  let hashes = 0;
  for (let i = 0; i < Player.hacknetNodes.length; ++i) {
    // hacknetNodes array only contains the hostnames of the servers.
    // Also, update the hash rate before processing
    const hostname = Player.hacknetNodes[i];
    if (hostname instanceof HacknetNode) throw new Error(`player nodes should not be HacknetNode`);
    const hserver = GetServer(hostname);
    if (!(hserver instanceof HacknetServer)) throw new Error(`player nodes must be HacknetServer`);
    hserver.updateHashRate(Player.mults.hacknet_node_money);
    const h = hserver.process(numCycles);
    hashes += h;
  }

  const wastedHashes = Player.hashManager.storeHashes(hashes);
  if (wastedHashes > 0) {
    const upgrade = HashUpgrades[HashUpgradeEnum.SellForMoney];
    if (upgrade === null) throw new Error("Could not get the hash upgrade");
    if (!upgrade.cost) throw new Error("Upgrade is not properly configured");

    const multiplier = wastedHashes / upgrade.cost;
    if (multiplier > 0) {
      Player.gainMoney(upgrade.value * multiplier, "hacknet");
    }
  }

  return hashes;
}

export function updateHashManagerCapacity(): void {
  if (!(Player.hashManager instanceof HashManager)) {
    console.error(`Player does not have a HashManager`);
    return;
  }

  const nodes = Player.hacknetNodes;
  if (nodes.length === 0) {
    Player.hashManager.updateCapacity(0);
    return;
  }

  let total = 0;
  for (let i = 0; i < nodes.length; ++i) {
    if (typeof nodes[i] !== "string") {
      Player.hashManager.updateCapacity(0);
      return;
    }
    const hostname = nodes[i];
    if (hostname instanceof HacknetNode) throw new Error(`player nodes should not be HacknetNode`);
    const h = GetServer(hostname);
    if (!(h instanceof HacknetServer)) {
      Player.hashManager.updateCapacity(0);
      return;
    }

    total += h.hashCapacity;
  }

  Player.hashManager.updateCapacity(total);
}

function applyEffectOfHashUpgrade(upgName: HashUpgradeEnum, upgTarget: string, count = 1): Result {
  const upg = HashUpgrades[upgName];

  switch (upgName) {
    case HashUpgradeEnum.SellForMoney: {
      Player.gainMoney(upg.value * count, "hacknet");
      break;
    }
    case HashUpgradeEnum.SellForCorporationFunds: {
      const corp = Player.corporation;
      if (corp === null) {
        return { success: false, message: "You have not created a corporation." };
      }
      corp.gainFunds(upg.value * count, "hacknet");
      break;
    }
    case HashUpgradeEnum.ReduceMinimumSecurity: {
      const target = GetServer(upgTarget);
      if (target == null) {
        return { success: false, message: `'${upgTarget}' is not a server.` };
      }
      if (!(target instanceof Server)) {
        return { success: false, message: `'${upgTarget}' is not a normal server.` };
      }
      if (!checkServerOwnership(target, ServerOwnershipType.Foreign)) {
        return {
          success: false,
          message: `'${upgTarget}' is not a valid target. You can only perform this action on servers that you do not own.`,
        };
      }

      target.changeMinimumSecurity(upg.value ** count, true);
      break;
    }
    case HashUpgradeEnum.IncreaseMaximumMoney: {
      const target = GetServer(upgTarget);
      if (target == null) {
        return { success: false, message: `'${upgTarget}' is not a server.` };
      }
      if (!(target instanceof Server)) {
        return { success: false, message: `'${upgTarget}' is not a normal server.` };
      }
      if (!checkServerOwnership(target, ServerOwnershipType.Foreign)) {
        return {
          success: false,
          message: `'${upgTarget}' is not a valid target. You can only perform this action on servers that you do not own.`,
        };
      }

      //Manually loop the change so as to properly handle the softcap
      for (let i = 0; i < count; i++) {
        target.changeMaximumMoney(upg.value);
      }
      break;
    }
    case HashUpgradeEnum.ImproveStudying: {
      // Multiplier is handled by HashManager
      break;
    }
    case HashUpgradeEnum.ImproveGymTraining: {
      // Multiplier is handled by HashManager
      break;
    }
    case HashUpgradeEnum.ExchangeForCorporationResearch: {
      const corp = Player.corporation;
      if (corp === null) {
        return { success: false, message: "You have not created a corporation." };
      }
      for (const division of corp.divisions.values()) {
        division.researchPoints += upg.value * count;
      }
      break;
    }
    case HashUpgradeEnum.ExchangeForBladeburnerRank: {
      const bladeburner = Player.bladeburner;
      if (bladeburner === null) {
        return { success: false, message: "You have not joined Bladeburner." };
      }
      bladeburner.changeRank(Player, upg.value * count);
      break;
    }
    case HashUpgradeEnum.ExchangeForBladeburnerSP: {
      const bladeburner = Player.bladeburner;
      if (bladeburner === null) {
        return { success: false, message: "You have not joined Bladeburner." };
      }

      bladeburner.skillPoints += upg.value * count;
      break;
    }
    case HashUpgradeEnum.GenerateCodingContract: {
      for (let i = 0; i < count; i++) {
        generateRandomContract();
      }
      break;
    }
    case HashUpgradeEnum.CompanyFavor: {
      if (!isMember("CompanyName", upgTarget)) {
        return { success: false, message: `'${upgTarget}' is not a company.` };
      }
      Companies[upgTarget].setFavor(Companies[upgTarget].favor + 5 * count);
      break;
    }
    default: {
      // Verify that the switch statement is exhaustive.
      const __a: never = upgName;
    }
  }

  return { success: true };
}

export function purchaseHashUpgrade(upgName: HashUpgradeEnum, upgTarget: string, count = 1): Result {
  if (!(Player.hashManager instanceof HashManager)) {
    exceptionAlert(new Error("Player does not have a HashManager"));
    return { success: false, message: "Player does not have a HashManager" };
  }

  /**
   * Spend hashes to buy the upgrade. The hashManager validates and handles the transaction (e.g., checks the upgrade
   * name, deducts the hash amount, increases the count of the upgrade).
   */
  const upgradeResult = Player.hashManager.upgrade(upgName, count);
  if (!upgradeResult.success) {
    return upgradeResult;
  }

  // Apply the effect. If we cannot apply it, the hashManager will roll back the transaction.
  const result = applyEffectOfHashUpgrade(upgName, upgTarget, count);
  if (!result.success) {
    Player.hashManager.refundUpgrade(upgName, count);
  }
  return result;
}
