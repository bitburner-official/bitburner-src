import { CONSTANTS } from "../Constants";

import { IHacknetNode } from "./IHacknetNode";

import { BaseServer } from "../Server/BaseServer";
import { HacknetServerConstants } from "./data/Constants";
import {
  calculateHashGainRate,
  calculateLevelUpgradeCost,
  calculateRamUpgradeCost,
  calculateCoreUpgradeCost,
  calculateCacheUpgradeCost,
} from "./formulas/HacknetServers";

import { IPAddress } from "../Types/strings";
import { createRandomIp } from "../utils/IPAddress";

import { IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { Player } from "@player";

interface IConstructorParams {
  adminRights?: boolean;
  hostname: string;
  ip?: IPAddress;
  isConnectedTo?: boolean;
  maxRam?: number;
  organizationName?: string;
}

/** Hacknet Servers - Reworked Hacknet Node mechanic for BitNode-9 */
export class HacknetServer extends BaseServer implements IHacknetNode {
  // Cache level. Affects hash Capacity
  cache = 1;

  // Number of cores. Improves hash production
  cores = 1;

  // Number of hashes that can be stored by this Hacknet Server
  hashCapacity = 0;

  // Hashes produced per second
  hashRate = 0;

  // Similar to Node level. Improves hash production
  level = 1;

  // How long this HacknetServer has existed, in seconds
  onlineTimeSeconds = 0;

  // Total number of hashes earned by this server
  totalHashesGenerated = 0;

  // Flag indicating whether this is a purchased server
  purchasedByPlayer = true;

  isHacknetServer = true;

  constructor(params: IConstructorParams = { hostname: "", ip: createRandomIp() }) {
    super(params);

    this.maxRam = 1;
    this.updateHashCapacity();
  }

  calculateCacheUpgradeCost(levels: number): number {
    return calculateCacheUpgradeCost(this.cache, levels);
  }

  calculateCoreUpgradeCost(levels: number, costMult: number): number {
    return calculateCoreUpgradeCost(this.cores, levels, costMult);
  }

  calculateLevelUpgradeCost(levels: number, costMult: number): number {
    return calculateLevelUpgradeCost(this.level, levels, costMult);
  }

  calculateRamUpgradeCost(levels: number, costMult: number): number {
    return calculateRamUpgradeCost(this.maxRam, levels, costMult);
  }

  // Process this Hacknet Server in the game loop. Returns the number of hashes generated
  process(numCycles = 1): number {
    const seconds = (numCycles * CONSTANTS.MilliPerCycle) / 1000;
    this.onlineTimeSeconds += seconds;

    const hashes = this.hashRate * seconds;
    this.totalHashesGenerated += hashes;

    return hashes;
  }

  upgradeCache(levels: number): void {
    this.cache = Math.min(HacknetServerConstants.MaxCache, Math.round(this.cache + levels));
    this.updateHashCapacity();
  }

  upgradeCore(levels: number, prodMult: number): void {
    this.cores = Math.min(HacknetServerConstants.MaxCores, Math.round(this.cores + levels));
    this.updateHashRate(prodMult);
    this.cpuCores = this.cores;
  }

  upgradeLevel(levels: number, prodMult: number): void {
    this.level = Math.min(HacknetServerConstants.MaxLevel, Math.round(this.level + levels));
    this.updateHashRate(prodMult);
  }

  upgradeRam(levels: number, prodMult: number): boolean {
    this.maxRam *= Math.pow(2, levels);
    this.maxRam = Math.min(HacknetServerConstants.MaxRam, Math.round(this.maxRam));
    this.updateHashRate(prodMult);

    return true;
  }

  updateRamUsed(ram: number): void {
    super.updateRamUsed(ram);
    this.updateHashRate(Player.mults.hacknet_node_money);
  }

  updateHashCapacity(): void {
    this.hashCapacity = 32 * Math.pow(2, this.cache);
  }

  updateHashRate(prodMult: number): void {
    this.hashRate = calculateHashGainRate(this.level, this.ramUsed, this.maxRam, this.cores, prodMult);

    if (isNaN(this.hashRate)) {
      this.hashRate = 0;
      console.error(
        `Error calculating Hacknet Server hash production. This is a bug. Please report to game dev`,
        false,
      );
    }
  }

  // Serialize the current object to a JSON save state
  toJSON(): IReviverValue {
    return this.toJSONBase("HacknetServer", includedKeys);
  }

  // Initializes a HacknetServer Object from a JSON save state
  static fromJSON(value: IReviverValue): HacknetServer {
    return BaseServer.fromJSONBase(value, HacknetServer, includedKeys);
  }
}
const includedKeys = BaseServer.getIncludedKeys(HacknetServer);

constructorsForReviver.HacknetServer = HacknetServer;
