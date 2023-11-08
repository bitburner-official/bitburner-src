import { CONSTANTS } from "../Constants";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Player } from "@player";
import { Person as IPerson } from "@nsdefs";
import { WorkerScript } from "../Netscript/WorkerScript";
import { Factions } from "../Faction/Factions";
import { CharityConstants } from "./data/Constants";
import { CharityVolunteer } from "./CharityVolunteer"
import { CharityVolunteerUpgrade } from "./CharityVolunteerUpgrade"
//import { calculateIntelligenceBonus } from "../PersonObjects/formulas/intelligence";

export const CharityResolvers: ((msProcessed: number) => void)[] = [];

interface IConstructorParams {
  name?: string;
  seedfunded?: boolean;
}

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
  prestigeGainRate: number
  visibilityGainRate: number;
  terrorGainRate: number;
  storedCycles: number;


  
  constructor(
    name: string,
    seedFunded: boolean,
  ) {
    this.name = name;
    this.seedFunded = seedFunded;
    this.bank = 0;
    this.spent = 0
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

  }

  getBank(): number {
    return this.bank;
  }

  /** Main process function called by the engine loop every game cycle */
  process(numCycles = 1): void {
    if (isNaN(numCycles)) {
      console.error(`NaN passed into Gang.process(): ${numCycles}`);
    }
    this.storedCycles += numCycles;
    if (this.storedCycles < CharityConstants.minCyclesToProcess) return;

    // Calculate how many cycles to actually process.
    const cycles = Math.min(this.storedCycles, CharityConstants.maxCyclesToProcess);

    try {
      this.processGains(cycles);
      this.processExperienceGains(cycles);
      this.storedCycles -= cycles;
    } catch (e: unknown) {
      console.error(`Exception caught when processing Gang: ${e}`);
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
    let moneySpendPerCycle = 0
    let karmaGainPerCycle = 0;
    let visibilityGainPerCycle = 0;
    let terrorGainPerCycle = 0;
    let prestigeGainPerCycle = 0
    

    for (const volunteer of this.volunteers) {
      karmaGainPerCycle += volunteer.calculateKarmaGain(this);
      moneyGainPerCycle += volunteer.calculateMoneyGain(this);
      moneySpendPerCycle += volunteer.calculateMoneySpend(this);
      visibilityGainPerCycle += volunteer.calculateVisibilityGain(this);
      terrorGainPerCycle += volunteer.calculateTerrorGain(this);
      prestigeGainPerCycle += volunteer.calculatePrestigeGain(this);
    }

    this.moneyGainRate = moneyGainPerCycle;
    this.moneySpendRate = moneySpendPerCycle;
    this.bank += moneyGainPerCycle - moneySpendPerCycle;
    this.visibilityGainRate = visibilityGainPerCycle;
    this.visibility += visibilityGainPerCycle;
    this.visibility = Math.min(this.visibility, 1);
    this.terrorGainRate = terrorGainPerCycle;
    this.terror += terrorGainPerCycle;
    this.terror = Math.min(this.terror, 1);
    this.prestigeGainRate = prestigeGainPerCycle; //  / numCycles;?
    this.prestige += prestigeGainPerCycle

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
      (Player.mults.faction_rep * prestigeGainPerCycle * favorMult) / CharityConstants.CharityPrestigeToReputationRatio;

    if (this.bank <= 0) {
      this.processNoBank();
    }
  }
  processNoBank(): void {
    for (const volunteer of this.volunteers) {
      //Stop them if they are doing a job that has money out.
      if (volunteer.getTask().isSpending) {
        volunteer.unassignFromTask();
      }
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

  getUpgradeCost(upg: CharityVolunteerUpgrade | null): number {
    if (upg === null) {
      return Infinity;
    }
    return upg.cost;
  }
}
