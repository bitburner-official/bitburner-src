import { CONSTANTS } from "../Constants";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Player } from "@player";
//import { Person as IPerson } from "@nsdefs";
import { WorkerScript } from "../Netscript/WorkerScript";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Factions } from "../Faction/Factions";
import { CharityORGConstants } from "./data/Constants";
import { CharityVolunteer } from "./CharityVolunteer";
import { CharityVolunteerUpgrade } from "./CharityVolunteerUpgrade";
import { CharityVolunteerTasks } from "./CharityVolunteerTasks";
import { IAscensionResult } from "./IAscensionResult";
import { exceptionAlert } from "../utils/helpers/exceptionAlert";
//import { calculateIntelligenceBonus } from "../PersonObjects/formulas/intelligence";

export const CharityResolvers: ((msProcessed: number) => void)[] = [];

/*interface IConstructorParams {
  name?: string;
  seedfunded?: boolean;
}*/

export class CharityORG {
  name: string;
  seedFunded: boolean;
  bank: number;
  spent: number;
  volunteers: CharityVolunteer[];
  visibility: number;
  terror: number;
  prestige: number;
  moneyGainRate: number;
  moneySpendRate: number;
  karmaGainRate: number;
  prestigeGainRate: number;
  visibilityGainRate: number;
  terrorGainRate: number;
  storedCycles: number;
  visibilityBooster: number;
  terrorBooster: number;
  completed: boolean;
  completionCycles: number;

  constructor(name = "My Charity", seedFunded = false) {
    this.name = name;
    this.seedFunded = seedFunded;
    this.bank = 0;
    this.spent = 0;
    this.volunteers = [];
    this.visibility = 0;
    this.terror = 50;
    this.prestige = 0;
    this.moneyGainRate = 0;
    this.moneySpendRate = 0;
    this.visibilityGainRate = 0;
    this.terrorGainRate = 0;
    this.karmaGainRate = 0;
    this.prestigeGainRate = 0;
    this.storedCycles = 0;
    this.visibilityBooster = 0;
    this.terrorBooster = 0;
    this.completed = false;
    this.completionCycles = 0;
  }

  getBank(): number {
    return this.bank;
  }

  /** Main process function called by the engine loop every game cycle */
  process(numCycles = 1): void {
    //Default numCycles from system is 10, 1000 is 1 second
    if (isNaN(numCycles)) {
      console.error(`NaN passed into charityORG.process(): ${numCycles}`);
    }
    this.storedCycles += numCycles;
    if (this.storedCycles < CharityORGConstants.minCyclesToProcess) return;
    // 10 is the number of cycles we are processing.  10 = 200ms

    // Calculate how many cycles to actually process.
    const cycles = Math.min(this.storedCycles, CharityORGConstants.maxCyclesToProcess);

    try {
      this.processGains(cycles);
      this.processExperienceGains(cycles);
      this.storedCycles -= cycles;
    } catch (e: unknown) {
      console.error(`Exception caught when processing Charity: ${e}`);
    }

    // Handle "nextUpdate" resolvers after this update
    for (const resolve of CharityResolvers.splice(0)) {
      resolve(cycles * CONSTANTS.MilliPerCycle);
    }
  }

  /** Process donations, terror, visibility, etc.
   * @param numCycles The number of cycles to process. */
  processGains(numCycles: number): void {
    let moneyGainPerCycle = 0;
    let moneySpendPerCycle = 0;
    let karmaGainPerCycle = 0;
    let visibilityGainPerCycle = 0;
    let terrorGainPerCycle = 0;
    let prestigeGainPerCycle = 0;

    for (const volunteer of this.volunteers) {
      karmaGainPerCycle += volunteer.calculateKarmaGain(this) * numCycles;
      moneyGainPerCycle += volunteer.calculateMoneyGain(this) * numCycles;
      moneySpendPerCycle += volunteer.calculateMoneySpend(this) * numCycles;
      visibilityGainPerCycle += volunteer.calculateVisibilityGain(this) * numCycles;
      terrorGainPerCycle += volunteer.calculateTerrorGain(this) * numCycles;
      prestigeGainPerCycle += volunteer.calculatePrestigeGain(this) * numCycles;
      volunteer.earnPrestige(numCycles, this);
    }
    //dialogBoxCreate("Terror: " + calculateTerrorMult({ prestige: this.prestige, terror: this.terror, visibility: this.visibility }) + "\n"
    //  + "Visibility: " + calculateVisibilityMult({ prestige: this.prestige, terror: this.terror, visibility: this.visibility }));
    const terrorbooster = this.terrorBooster > 0 ? 0.9 : 1;
    const visbooster = this.visibilityBooster > 0 ? 0.9 : 1;
    this.moneyGainRate = moneyGainPerCycle;
    this.moneySpendRate = moneySpendPerCycle;
    this.spent -= moneySpendPerCycle;
    this.bank += moneyGainPerCycle - moneySpendPerCycle;
    this.visibilityGainRate = visibilityGainPerCycle - this.visibilityPerCycle() * numCycles * visbooster;
    this.visibility += visibilityGainPerCycle - this.visibilityPerCycle() * numCycles * visbooster;
    this.visibility = Math.max(Math.min(this.visibility, 100), 0);
    this.terrorGainRate = terrorGainPerCycle + this.terrorPerCycle() * numCycles * terrorbooster;
    this.terror += terrorGainPerCycle + this.terrorPerCycle() * numCycles * terrorbooster;
    this.terror = Math.max(Math.min(this.terror, 100), 0);
    this.prestigeGainRate = prestigeGainPerCycle;
    this.prestige += prestigeGainPerCycle;
    this.karmaGainRate = karmaGainPerCycle;
    Player.karma += karmaGainPerCycle;
    this.terrorBooster -= numCycles;
    this.terrorBooster = Math.max(this.terrorBooster, 0);
    this.visibilityBooster -= numCycles;
    this.visibilityBooster = Math.max(this.visibilityBooster, 0);
    if (this.terror === 0 && this.visibility === 100) {
      this.completionCycles += numCycles * 200;
    } else {
      this.completionCycles = 0;
    }
    if (this.completionCycles > 5 * 60 * 10) {
      this.completed = true;
    }

    // Faction reputation gains is respect gain divided by some constant
    const charityFaction = Factions["Charity"];
    if (!charityFaction) {
      dialogBoxCreate(
        "ERROR: Could not get the Faction associated with your charity. This is a bug, please report to game dev",
      );
      throw new Error("Could not find the faction associated with this charity.");
    }
    const favorMult = 1 + charityFaction.favor / 100;

    charityFaction.playerReputation +=
      (Player.mults.faction_rep * prestigeGainPerCycle * favorMult) /
      CharityORGConstants.CharityPrestigeToReputationRatio;

    if (this.bank <= 0) {
      this.processNoBank();
    }
  }
  visibilityPerCycle(): number {
    //If visibility is high, it's gain is increased.  If it's low, it's decreased.
    return 0.00000033 * Math.pow(this.visibility, 4); // * this.visibility * this.visibility;
  }
  terrorPerCycle(): number {
    //If terror is low, it's gain is increased.  If it's high, it's decreased.
    const mod = 100 - this.terror; // 1x at max terror, 1000000x at 0 terror.
    return 0.00000033 * Math.pow(mod, 4); // * mod * mod;
  }
  processNoBank(): void {
    for (const volunteer of this.volunteers) {
      //Stop them if they are doing a job that has money out.
      if (volunteer.getTask().isSpending) {
        volunteer.unassignFromTask();
      }
    }
  }
  canRecruitMember(): boolean {
    if (this.volunteers.length >= CharityORGConstants.MaximumCharityMembers) return false;
    return this.prestige >= this.prestigeForNextRecruit();
  }
  /** @returns The prestige threshold needed for the next volunteer recruitment. Infinity if already at or above max members. */
  prestigeForNextRecruit(): number {
    if (this.volunteers.length < CharityORGConstants.numFreeMembers) return 0;
    if (this.volunteers.length >= CharityORGConstants.MaximumCharityMembers) {
      return Infinity;
    }
    const exponent = this.volunteers.length - 1;
    return Math.pow(CharityORGConstants.recruitThresholdBase, exponent);
  }
  recruitMember(name: string): boolean {
    name = String(name);
    if (name === "" || !this.canRecruitMember()) return false;

    // Check for already-existing names
    const sameNames = this.volunteers.filter((m) => m.name === name);
    if (sameNames.length >= 1) return false;

    const member = new CharityVolunteer(name);
    this.volunteers.push(member);
    return true;
  }
  ascendMember(member: CharityVolunteer, workerScript?: WorkerScript): IAscensionResult {
    try {
      const res = member.ascend();
      this.prestige = Math.max(1, this.prestige - res.prestige);
      if (workerScript) {
        workerScript.log("charityORG.ascendMember", () => `Ascended Charity volunteer ${member.name}`);
      }
      return res;
    } catch (e: unknown) {
      if (workerScript == null) {
        exceptionAlert(e);
      }
      throw e; // Re-throw, will be caught in the Netscript Function
    }
  }
  /** Process member experience gain
   * @param numCycles The number of cycles to process. */
  processExperienceGains(numCycles: number): void {
    for (const volunteer of this.volunteers) {
      volunteer.gainExperience(numCycles);
      volunteer.updateSkillLevels();
    }
  }
  getAllTaskNames(): string[] {
    return Object.keys(CharityVolunteerTasks).filter((taskName: string) => {
      const task = CharityVolunteerTasks[taskName];
      if (task === null) return false;
      if (task.name === "Unassigned") return false;
      return this.bank <= 0 && task.isSpending ? false : true;
      if (!task.isSpending) return true;
    });
  }
  getUpgradeCost(upg: CharityVolunteerUpgrade | null): number {
    if (upg === null) {
      return Infinity;
    }
    return upg.cost;
  }
  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("CharityORG", this);
  }

  /** Initializes a CharityORG object from a JSON save state. */
  static fromJSON(value: IReviverValue): CharityORG {
    return Generic_fromJSON(CharityORG, value.data);
  }
}
constructorsForReviver.CharityORG = CharityORG;
