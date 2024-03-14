/**
 * TODO unplanned
 * Add police clashes
 * balance point to keep them from running out of control
 */
import type { PromisePair } from "../Types/Promises";

import { Factions } from "../Faction/Factions";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";

import { exceptionAlert } from "../utils/helpers/exceptionAlert";
import { getRandomInt } from "../utils/helpers/getRandomInt";

import { GangMemberUpgrade } from "./GangMemberUpgrade";
import { GangConstants } from "./data/Constants";
import { GangMemberTasks } from "./GangMemberTasks";
import { IAscensionResult } from "./IAscensionResult";

import { AllGangs } from "./AllGangs";
import { GangMember } from "./GangMember";

import { WorkerScript } from "../Netscript/WorkerScript";
import { Player } from "@player";
import { FactionName } from "@enums";
import { CONSTANTS } from "../Constants";
import { AllGangFactionInfo } from "./data/FactionInfo";

export const GangPromise: PromisePair<number> = { promise: null, resolve: null };

export class Gang {
  facName: FactionName;
  members: GangMember[];
  wanted: number;
  respect: number;

  /** Respect gain rate, per cycle */
  respectGainRate: number;
  /** Wanted level gain rate, per cycle */
  wantedGainRate: number;
  /** Money gain rate, per cycle */
  moneyGainRate: number;

  storedCycles: number;

  storedTerritoryAndPowerCycles: number;

  territoryClashChance: number;
  territoryWarfareEngaged: boolean;

  notifyMemberDeath: boolean;

  constructor(facName = FactionName.SlumSnakes) {
    this.facName = facName;
    this.members = [];
    this.wanted = 1;
    this.respect = 1;

    this.respectGainRate = 0;
    this.wantedGainRate = 0;
    this.moneyGainRate = 0;

    // When processing gains, this stores the number of cycles until some
    // limit is reached, and then calculates and applies the gains only at that limit
    this.storedCycles = 0;

    // Separate variable to keep track of cycles for Territory + Power gang, which
    // happens on a slower "clock" than normal processing
    this.storedTerritoryAndPowerCycles = 0;

    this.territoryClashChance = 0;
    this.territoryWarfareEngaged = false;

    this.notifyMemberDeath = true;
  }

  getPower(): number {
    return AllGangs[this.facName].power;
  }

  getTerritory(): number {
    return AllGangs[this.facName].territory;
  }

  /** Main process function called by the engine loop every game cycle */
  process(numCycles = 1): void {
    if (isNaN(numCycles)) {
      console.error(`NaN passed into Gang.process(): ${numCycles}`);
    }
    this.storedCycles += numCycles;
    if (this.storedCycles < GangConstants.minCyclesToProcess) return;

    // Calculate how many cycles to actually process.
    const cycles = Math.min(this.storedCycles, GangConstants.maxCyclesToProcess);

    try {
      this.processGains(cycles);
      this.processExperienceGains(cycles);
      this.processTerritoryAndPowerGains(cycles);
      this.storedCycles -= cycles;
    } catch (e: unknown) {
      console.error(`Exception caught when processing Gang: ${e}`);
    }

    // Handle "nextUpdate" resolver after this update
    if (GangPromise.resolve) {
      GangPromise.resolve(cycles * CONSTANTS.MilliPerCycle);
      GangPromise.resolve = null;
      GangPromise.promise = null;
    }
  }

  /** Process respect/wanted/money gains
   * @param numCycles The number of cycles to process. */
  processGains(numCycles: number): void {
    let moneyGainPerCycle = 0;
    let wantedLevelGainPerCycle = 0;
    let respectGainsTotal = 0;
    /** Number of members performing actions that lower wanted level */
    let justice = 0;

    for (const member of this.members) {
      respectGainsTotal += member.earnRespect(numCycles, this);
      moneyGainPerCycle += member.calculateMoneyGain(this);
      wantedLevelGainPerCycle += member.calculateWantedLevelGain(this);
      if (member.getTask().baseWanted < 0) justice++;
    }

    this.respectGainRate = respectGainsTotal / numCycles;
    this.wantedGainRate = wantedLevelGainPerCycle;
    this.moneyGainRate = moneyGainPerCycle;
    this.respect += respectGainsTotal;

    // Faction reputation gains is respect gain divided by some constant
    const gangFaction = Factions[this.facName];
    if (!gangFaction) {
      dialogBoxCreate(
        "ERROR: Could not get Faction associates with your gang. This is a bug, please report to game dev",
      );
      throw new Error("Could not find the faction associated with this gang.");
    }
    const favorMult = 1 + gangFaction.favor / 100;

    gangFaction.playerReputation +=
      (Player.mults.faction_rep * respectGainsTotal * favorMult) / GangConstants.GangRespectToReputationRatio;

    if (this.wanted !== 1 || wantedLevelGainPerCycle >= 0) {
      const oldWanted = this.wanted;
      const newWanted = oldWanted + wantedLevelGainPerCycle * numCycles;
      // Allows recovery when wanted / respect ratio is too high
      this.wanted = newWanted * (1 - justice * 0.001);
      this.wantedGainRate -= newWanted - this.wanted;
      // Prevent overflow
      if (this.wanted < 1 || (wantedLevelGainPerCycle <= 0 && this.wanted > oldWanted)) this.wanted = 1;
    }
    Player.gainMoney(moneyGainPerCycle * numCycles, "gang");
  }

  /** Process Territory and Power
   * @param numCycles The number of cycles to process. */
  processTerritoryAndPowerGains(numCycles: number): void {
    function calculateTerritoryGain(winnerPower: number, loserPower: number, loserTerritory: number): number {
      const powerBonus = Math.max(1, 1 + Math.log(winnerPower / loserPower) / Math.log(50));
      const gains = Math.min(loserTerritory, powerBonus * 0.0001 * (Math.random() + 0.5));
      return gains;
    }

    this.storedTerritoryAndPowerCycles += numCycles;
    if (this.storedTerritoryAndPowerCycles < GangConstants.CyclesPerTerritoryAndPowerUpdate) return;
    this.storedTerritoryAndPowerCycles -= GangConstants.CyclesPerTerritoryAndPowerUpdate;

    // Process power first
    const gangName = this.facName;
    for (const name of Object.keys(AllGangs)) {
      if (Object.hasOwn(AllGangs, name)) {
        if (name == gangName) {
          AllGangs[name].power += this.calculatePower();
        } else {
          // All NPC gangs get random power gains
          const gainRoll = Math.random();
          if (gainRoll < 0.5) {
            // Multiplicative gain (50% chance)
            // This is capped per cycle, to prevent it from getting out of control
            AllGangs[name].power += Math.min(0.85, AllGangs[name].power * 0.005);
          } else {
            // Additive gain (50% chance)
            AllGangs[name].power += 0.75 * gainRoll * AllGangs[name].territory * AllGangFactionInfo[name].territoryPowerMultiplier;
          }
        }
      }
    }

    // Determine if territory should be processed
    if (this.territoryWarfareEngaged) {
      this.territoryClashChance = 1;
    } else if (this.territoryClashChance > 0) {
      // Engagement turned off, but still a positive clash chance. So there's
      // still a chance of clashing but it slowly goes down over time
      this.territoryClashChance = Math.max(0, this.territoryClashChance - 0.01);
    }

    // Then process territory
    const gangs = GangConstants.Names.filter((g) => AllGangs[g].territory > 0 || g === gangName);
    if (gangs.length > 1) {
      for (let i = 0; i < gangs.length; ++i) {
        const others = gangs.filter((e) => {
          return e !== gangs[i];
        });
        const other = getRandomInt(0, others.length - 1);

        const thisGang = gangs[i];
        const otherGang = others[other];

        // If either of the gangs involved in this clash is the player, determine
        // whether to skip or process it using the clash chance
        if (thisGang === gangName || otherGang === gangName) {
          if (!(Math.random() < this.territoryClashChance)) continue;
        }

        const thisPwr = AllGangs[thisGang].power;
        const otherPwr = AllGangs[otherGang].power;
        const thisChance = thisPwr / (thisPwr + otherPwr);

        if (Math.random() < thisChance) {
          if (AllGangs[otherGang].territory <= 0) return;
          const territoryGain = calculateTerritoryGain(thisPwr, otherPwr, AllGangs[otherGang].territory);
          AllGangs[thisGang].territory += territoryGain;
          AllGangs[otherGang].territory -= territoryGain;
          if (thisGang === gangName) {
            this.clash(true); // Player won
            AllGangs[otherGang].power *= 1 / 1.01;
          } else if (otherGang === gangName) {
            this.clash(false); // Player lost
          } else {
            AllGangs[otherGang].power *= 1 / 1.01;
          }
        } else {
          if (AllGangs[thisGang].territory <= 0) return;
          const territoryGain = calculateTerritoryGain(otherPwr, thisPwr, AllGangs[thisGang].territory);
          AllGangs[thisGang].territory -= territoryGain;
          AllGangs[otherGang].territory += territoryGain;
          if (thisGang === gangName) {
            this.clash(false); // Player lost
          } else if (otherGang === gangName) {
            this.clash(true); // Player won
            AllGangs[thisGang].power *= 1 / 1.01;
          } else {
            AllGangs[thisGang].power *= 1 / 1.01;
          }
        }

        const total = Object.values(AllGangs)
          .map((g) => g.territory)
          .reduce((p, c) => p + c, 0);
        Object.values(AllGangs).forEach((g) => (g.territory /= total));
      }
    }
  }

  /** Process member experience gain
   * @param numCycles The number of cycles to process. */
  processExperienceGains(numCycles: number): void {
    for (const member of this.members) {
      member.gainExperience(numCycles);
      member.updateSkillLevels();
    }
  }

  clash(won = false): void {
    // Determine if a gang member should die
    let baseDeathChance = 0.01;
    if (won) baseDeathChance /= 2;
    // If the clash was lost, the player loses a small percentage of power
    else AllGangs[this.facName].power *= 1 / 1.008;

    // Deaths can only occur during X% of clashes
    if (Math.random() < 0.65) return;

    for (let i = this.members.length - 1; i >= 0; --i) {
      const member = this.members[i];
      const task = member.getTask();

      if (!task.deathRisk) continue;

      // Chance to die is decreased based on defense
      const modifiedDeathChance = baseDeathChance / Math.pow(member.def, 0.6);
      if (Math.random() < modifiedDeathChance) {
        this.killMember(member);
      }
    }
  }

  canRecruitMember(): boolean {
    if (this.members.length >= GangConstants.MaximumGangMembers) return false;
    return this.respect >= this.respectForNextRecruit();
  }

  /** @returns The respect threshold needed for the next member recruitment. Infinity if already at or above max members. */
  respectForNextRecruit(): number {
    if (this.members.length < GangConstants.numFreeMembers) return 0;
    if (this.members.length >= GangConstants.MaximumGangMembers) {
      return Infinity;
    }
    const exponent = this.members.length - GangConstants.numFreeMembers + 1;
    return Math.pow(GangConstants.recruitThresholdBase, exponent);
  }

  getRecruitsAvailable(): number {
    const numFreeMembers = 3;
    const recruitCostBase = 5;
    if (this.members.length < numFreeMembers && this.respect < Math.pow(recruitCostBase, numFreeMembers))
      return numFreeMembers - this.members.length; // if the max possible is less than freeMembers
    return Math.floor(Math.log(this.respect) / Math.log(recruitCostBase)) + numFreeMembers - this.members.length; //else
  }

  getRecruitTypeAvailable(isEnforcer: boolean): number {
    const max = isEnforcer ? AllGangFactionInfo[this.facName].numEnforcers : AllGangFactionInfo[this.facName].numHackers;
    return max - this.members.filter(m => m.isEnforcer === isEnforcer).length;
  }

  recruitMember(name: string, isEnforcer: boolean): boolean {
    name = String(name);
    if (name === "" || isEnforcer === null || !this.canRecruitMember()) return false;

    if (this.getRecruitTypeAvailable(isEnforcer) <= 0) return false;

    // Check for already-existing names
    const sameNames = this.members.filter((m) => m.name === name);
    if (sameNames.length >= 1) return false;

    const member = new GangMember(name, isEnforcer);
    this.members.push(member);
    return true;
  }

  // Money and Respect gains multiplied by this number (< 1)
  getWantedPenalty(): number {
    return this.respect / (this.respect + this.wanted);
  }

  //Calculates power GAIN, which is added onto the Gang's existing power
  calculatePower(): number {
    let memberTotal = 0;
    for (let i = 0; i < this.members.length; ++i) {
      memberTotal += this.members[i].calculatePower();
    }
    return Math.max(0.002, this.getTerritory()) * memberTotal;
  }

  killMember(member: GangMember, suppressMessage = false): void {
    // Player loses a percentage of total respect, plus whatever respect that member has earned
    const totalRespect = this.respect;
    const lostRespect = 0.05 * totalRespect + member.earnedRespect;
    this.respect = Math.max(1, totalRespect - lostRespect);

    for (let i = 0; i < this.members.length; ++i) {
      if (member.name === this.members[i].name) {
        this.members.splice(i, 1);
        break;
      }
    }

    // Notify of death
    if (this.notifyMemberDeath && !suppressMessage) {
      dialogBoxCreate(`${member.name} was killed in a gang clash! You lost ${lostRespect} respect`);
    }
  }

  ascendMember(member: GangMember, workerScript?: WorkerScript): IAscensionResult {
    try {
      const res = member.ascend();
      this.respect = Math.max(1, this.respect - res.respect);
      if (workerScript) {
        workerScript.log("gang.ascendMember", () => `Ascended Gang member ${member.name}`);
      }
      return res;
    } catch (e: unknown) {
      if (workerScript == null) {
        exceptionAlert(e);
      }
      throw e; // Re-throw, will be caught in the Netscript Function
    }
  }

  // Cost of upgrade gets cheaper as gang increases in respect + power
  getDiscount(): number {
    const power = this.getPower();
    const respect = this.respect;

    const respectLinearFac = 5e6;
    const powerLinearFac = 1e6;
    const discount =
      Math.pow(respect, 0.01) + respect / respectLinearFac + Math.pow(power, 0.01) + power / powerLinearFac - 1;
    return Math.max(1, discount);
  }

  /** Returns only valid tasks for this gang. Excludes 'Unassigned' */
  getAllTaskNames(isEnforcer?: boolean): string[] {
    return Object.keys(GangMemberTasks).filter((taskName: string) => {
      const task = GangMemberTasks[taskName];
      if (task == null) return false;
      if (task.name === "Unassigned") return false;
      if (isEnforcer === undefined) return true;
      // yes you need both checks
      return !isEnforcer === task.allowHackers || isEnforcer === task.allowEnforcers;
    });
  }

  getUpgradeCost(upg: GangMemberUpgrade | null): number {
    if (upg == null) {
      return Infinity;
    }
    return upg.cost / this.getDiscount();
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("Gang", this);
  }

  /** Initializes a Gang object from a JSON save state. */
  static fromJSON(value: IReviverValue): Gang {
    return Generic_fromJSON(Gang, value.data);
  }
}

constructorsForReviver.Gang = Gang;
