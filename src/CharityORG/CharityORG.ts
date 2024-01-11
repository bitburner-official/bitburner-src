import { CONSTANTS } from "../Constants";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Player } from "@player";
import { WorkerScript } from "../Netscript/WorkerScript";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Factions } from "../Faction/Factions";
import { FactionName } from "../Faction/Enums";
import { CharityORGConstants } from "./data/Constants";
import { CharityVolunteer } from "./CharityVolunteer";
import { CharityVolunteerTask } from "./CharityVolunteerTask";
import { CharityEvent, ModifyAreas, BannerPiece, AugmentationAreas } from "./CharityEvent";
import { CharityVolunteerUpgrade } from "./CharityVolunteerUpgrade";
import { CharityVolunteerTasks } from "./CharityVolunteerTasks";
import { IAscensionResult } from "./IAscensionResult";
import { exceptionAlert } from "../utils/helpers/exceptionAlert";
import { isNull } from "lodash";
import { Modifier } from "./CharityEvent";
import { Augmentation } from "../Augmentation/Augmentation";
import { AugmentationName } from "../Enums";

export const CharityResolvers: ((msProcessed: number) => void)[] = [];
export const CharityEventTasks: Record<string, CharityVolunteerTask> = {};

export class CharityMessage {
  message: string;
  timeStamp: number;

  constructor(msg: string) {
    const date = new Date();
    const mm = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();
    const dd = date.getDate() < 10 ? "0" + date.getDate() : date.getDate().toString();
    const year = date.getFullYear().toString();
    const h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours().toString();
    const m = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes().toString();
    const s = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds().toString();

    this.message = year + "/" + mm + "/" + dd + " " + h + ":" + m + ":" + s + " - " + msg;
    this.timeStamp = performance.now();
  }
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
  prestigeGainRate: number;
  visibilityGainRate: number;
  terrorGainRate: number;
  storedCycles: number;
  visibilityBooster: number;
  terrorBooster: number;
  visibilityDrain: number;
  terrorDrain: number;
  stopAttacks: number;
  fastAttacks: number;
  fastTasks: number;
  slowTasks: number;
  random: number;
  completed: boolean;
  completionCycles: number;
  messages: CharityMessage[];
  itemMessages: CharityMessage[];
  karmaMessages: CharityMessage[];
  itemUseMessages: CharityMessage[];
  waitingEvents: CharityEvent[];
  currentEvents: CharityEvent[];
  masterModifiers: Modifier[];
  newEventTimer: number;
  newEventTimerAtk: number;
  counter: number;
  bannerCounter: number;
  luckyCoin: number;
  ascensionToken: number;
  decoyJuice: number;
  randomDice: number;
  javaJuice: number;
  ticketStub: number;
  charityAugment: Augmentation;
  bannerPieces: BannerPiece[];
  bannerPiecesStore: BannerPiece[];
  bannerPower: number;
  luck: number;

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
    this.visibilityDrain = 0;
    this.terrorDrain = 0;
    this.stopAttacks = 0;
    this.fastAttacks = 0;
    this.fastTasks = 0;
    this.slowTasks = 0;
    this.random = 0;
    this.completed = false;
    this.completionCycles = 0;
    this.messages = [];
    this.itemMessages = [];
    this.karmaMessages = [];
    this.itemUseMessages = [];
    this.waitingEvents = [];
    this.currentEvents = [];
    this.masterModifiers = [];
    this.newEventTimer = 0;
    this.newEventTimerAtk = 0;
    this.counter = 0;
    this.bannerCounter = 0;
    this.luckyCoin = 0;
    this.ascensionToken = 0;
    this.decoyJuice = 0;
    this.randomDice = 0;
    this.javaJuice = 0;
    this.ticketStub = 0;
    this.charityAugment = new Augmentation({
      info: "Special",
      name: AugmentationName.Charity,
      moneyCost: 0,
      repCost: 0,
      factions: [FactionName.Charity],
      hacking: 1,
      strength: 1,
      defense: 1,
      dexterity: 1,
      agility: 1,
      charisma: 1,
      hacking_exp: 1,
      strength_exp: 1,
      defense_exp: 1,
      dexterity_exp: 1,
      agility_exp: 1,
      charisma_exp: 1,
      hacking_chance: 1,
      hacking_speed: 1,
      hacking_money: 1,
      hacking_grow: 1,
      company_rep: 1,
      faction_rep: 1,
      crime_money: 1,
      crime_success: 1,
      charity_money: 1,
      charity_success: 1,
      work_money: 1,
      hacknet_node_money: 1,
      hacknet_node_purchase_cost: 1,
      hacknet_node_ram_cost: 1,
      hacknet_node_core_cost: 1,
      hacknet_node_level_cost: 1,
      bladeburner_max_stamina: 1,
      bladeburner_stamina_gain: 1,
      bladeburner_analysis: 1,
      bladeburner_success_chance: 1,
    });
    this.bannerPieces = [];
    this.bannerPiecesStore = [];
    this.bannerPower = 0;
    this.luck = 0;
  }

  addMessage(message: string): void {
    const msg = message;
    if (isNull(msg)) return;
    this.messages.unshift(new CharityMessage(msg));
    while (this.messages.length > CharityORGConstants.CharityMaxMessages) this.messages.pop();
  }
  addItemMessage(message: string): void {
    const msg = message;
    if (isNull(msg)) return;
    this.itemMessages.unshift(new CharityMessage(msg));
    while (this.itemMessages.length > CharityORGConstants.CharityMaxMessages) this.itemMessages.pop();
  }
  addKarmaMessage(message: string): void {
    const msg = message;
    if (isNull(msg)) return;
    this.karmaMessages.unshift(new CharityMessage(msg));
    while (this.karmaMessages.length > CharityORGConstants.CharityMaxMessages) this.karmaMessages.pop();
  }
  addItemUseMessage(message: string): void {
    const msg = message;
    if (isNull(msg)) return;
    this.itemUseMessages.unshift(new CharityMessage(msg));
    while (this.itemUseMessages.length > CharityORGConstants.CharityMaxMessages) this.itemUseMessages.pop();
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
      this.processNewEvents(cycles);
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

    // Process volunteers and get their efforts
    for (const volunteer of this.volunteers) {
      const karmaGainMod = this.masterModifiers.find((m) => m.area === ModifyAreas.karma_gain);
      if (karmaGainMod !== undefined)
        karmaGainPerCycle += ((volunteer.calculateKarmaGain(this) * (100 + karmaGainMod.strength)) / 100) * numCycles;
      else karmaGainPerCycle += volunteer.calculateKarmaGain(this) * numCycles;

      const moneyGainMod = this.masterModifiers.find((m) => m.area === ModifyAreas.money_gain);
      if (moneyGainMod !== undefined)
        moneyGainPerCycle += ((volunteer.calculateMoneyGain(this) * (100 + moneyGainMod.strength)) / 100) * numCycles;
      else moneyGainPerCycle += volunteer.calculateMoneyGain(this) * numCycles;

      const moneySpendMod = this.masterModifiers.find((m) => m.area === ModifyAreas.money_spend);
      if (moneySpendMod !== undefined)
        moneySpendPerCycle +=
          ((volunteer.calculateMoneySpend(this) * (100 + moneySpendMod.strength)) / 100) * numCycles;
      else moneySpendPerCycle += volunteer.calculateMoneySpend(this) * numCycles;

      const visibilityGainMod = this.masterModifiers.find((m) => m.area === ModifyAreas.visibility_gain);
      if (visibilityGainMod !== undefined)
        visibilityGainPerCycle +=
          ((volunteer.calculateVisibilityGain(this) * (100 + visibilityGainMod.strength)) / 100) * numCycles;
      else visibilityGainPerCycle += volunteer.calculateVisibilityGain(this) * numCycles;

      const terrorGainMod = this.masterModifiers.find((m) => m.area === ModifyAreas.terror_gain);
      if (terrorGainMod !== undefined)
        terrorGainPerCycle +=
          ((volunteer.calculateTerrorGain(this) * (100 + terrorGainMod.strength)) / 100) * numCycles;
      else terrorGainPerCycle += volunteer.calculateTerrorGain(this) * numCycles;

      const prestigeGainMod = this.masterModifiers.find((m) => m.area === ModifyAreas.prestige_gain);
      if (prestigeGainMod !== undefined) {
        prestigeGainPerCycle +=
          ((volunteer.calculatePrestigeGain(this) * (100 + prestigeGainMod.strength)) / 100) * numCycles;
        const mod = (100 + prestigeGainMod.strength) / 100;
        volunteer.earnPrestige(numCycles, mod, this);
      } else {
        prestigeGainPerCycle += volunteer.calculatePrestigeGain(this) * numCycles;
        volunteer.earnPrestige(numCycles, 1, this);
      }

      for (const event of this.currentEvents) {
        if (volunteer.getTask() === event.taskObject && (moneyGainPerCycle !== 0 || moneySpendPerCycle !== 0))
          event.processWork(numCycles);
      }
    }

    // Process the event lists, both the ones you are working on and the ones waiting in queue
    const tempList: CharityEvent[] = [];
    for (const event of this.currentEvents) {
      event.process(numCycles);
      if (event.cyclesCompleted >= event.cyclesNeeded) {
        event.processCompleted();
        tempList.push(event);
      }
      if (event.hasTimer && event.cyclesElapsed > event.cyclesTillDeath) {
        event.processDeath();
        tempList.push(event);
      }
    }
    this.currentEvents = this.currentEvents.filter((e) => !tempList.includes(e)); // Filter out the ones that are done
    this.volunteers.forEach((v) => {
      if (tempList.map((l) => l.taskObject.name).includes(v.task)) v.unassignFromTask();
    });
    tempList.length = 0;

    for (const event of this.waitingEvents) {
      event.process(numCycles);
      if (event.cyclesElapsed >= event.cyclesTillRemoved) {
        event.processRemoval();
        tempList.push(event);
      }
    }
    this.waitingEvents = this.waitingEvents.filter((e) => !tempList.includes(e)); // Filter out the ones that are done
    this.updateMasterMods();

    //dialogBoxCreate("Terror: " + calculateTerrorMult({ prestige: this.prestige, terror: this.terror, visibility: this.visibility }) + "\n"
    //  + "Visibility: " + calculateVisibilityMult({ prestige: this.prestige, terror: this.terror, visibility: this.visibility }));
    const terrorMod = this.terrorBooster > 0 ? 0.9 : this.terrorDrain > 0 ? 1.1 : 1;
    const visMod = this.visibilityBooster > 0 ? 1.1 : this.visibilityDrain > 0 ? 0.9 : 1;
    this.moneyGainRate = moneyGainPerCycle;
    this.moneySpendRate = moneySpendPerCycle;
    this.spent -= moneySpendPerCycle;
    this.bank += moneyGainPerCycle - moneySpendPerCycle;
    this.visibilityGainRate = visibilityGainPerCycle - this.visibilityPerCycle() * numCycles * visMod;
    this.visibility += Math.min(
      Math.max(visibilityGainPerCycle - this.visibilityPerCycle() * numCycles * visMod, -1),
      0.1,
    );
    this.visibility = Math.max(Math.min(this.visibility, 100), 0);
    this.terrorGainRate = terrorGainPerCycle + this.terrorPerCycle() * numCycles * terrorMod;
    this.terror += Math.min(Math.max(terrorGainPerCycle + this.terrorPerCycle() * numCycles * terrorMod, -0.1), 1);
    this.terror = Math.max(Math.min(this.terror, 100), 0);
    this.prestigeGainRate = prestigeGainPerCycle;
    this.prestige += prestigeGainPerCycle;
    this.karmaGainRate = karmaGainPerCycle;
    Player.karma += karmaGainPerCycle;
    this.terrorBooster = this.processBooster(this.terrorBooster, numCycles);
    this.visibilityBooster = this.processBooster(this.visibilityBooster, numCycles);
    this.terrorDrain = this.processBooster(this.terrorDrain, numCycles);
    this.visibilityDrain = this.processBooster(this.visibilityDrain, numCycles);
    this.stopAttacks = this.processBooster(this.stopAttacks, numCycles);
    this.fastAttacks = this.processBooster(this.fastAttacks, numCycles);
    this.fastTasks = this.processBooster(this.fastTasks, numCycles);
    this.slowTasks = this.processBooster(this.slowTasks, numCycles);
    if (this.terror === 0 && this.visibility === 100) {
      this.completionCycles += numCycles;
    } else {
      this.completionCycles = 0;
    }
    if (this.completionCycles > 5 * 60 * 5) {
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

    if (this.bank <= 0 && this.moneySpendRate > 0) {
      this.processNoBank();
    }
  }
  processNewEvents(cycles: number): void {
    // 1 cycle is 200ms.  5 cycles is 1 second
    const atkMod = this.fastAttacks ? 1.1 : this.stopAttacks ? 0 : 1;
    this.newEventTimer += cycles;
    this.newEventTimerAtk += cycles * atkMod;

    if (this.newEventTimer >= 5 * 60 * 0.25) {
      // every 15 seconds
      const event = new CharityEvent("good event", true, false, 10000);
      event.randomize(true);
      this.waitingEvents.push(event);

      const fundraise = new CharityEvent("good event", true, false, 10000);
      fundraise.randomize(true, true);
      this.waitingEvents.push(fundraise);
      this.newEventTimer = 0;
    }
    if (this.newEventTimerAtk >= 5 * 60 * 6 && this.volunteers.length >= 4) {
      const event = new CharityEvent("bad event", false, true, 10000);
      event.randomize(false);
      this.currentEvents.push(event);

      //Random Attack Effect
      const baseModifyer = Math.log10(event.rarity) / 4;
      const rndmod = Math.random() * 0.4 + 0.8;
      const modstr = ((baseModifyer * (Math.log10(event.prizeLevel) / 5) * (Math.random() * 0.4 + 0.8)) / 3) * rndmod;
      switch (Math.floor(Math.random() * 5)) {
        case 0: {
          //Visibility Drain
          const visDrainTime = Math.floor(modstr * 5 * 20 * 10);
          if (this.visibilityBooster > 0) {
            if (visDrainTime <= this.visibilityBooster) this.visibilityBooster -= visDrainTime;
            else {
              const remainingTime = visDrainTime - this.visibilityBooster;
              this.visibilityBooster = 0;
              this.visibilityDrain += remainingTime;
            }
          } else {
            this.visibilityDrain += visDrainTime;
          }
          break;
        }
        case 1: {
          //Terror Drain
          const terrorDrainTime = Math.floor(modstr * 5 * 20 * 10);
          if (this.terrorBooster > 0) {
            if (terrorDrainTime <= this.terrorBooster) this.terrorBooster -= terrorDrainTime;
            else {
              const remainingTime = terrorDrainTime - this.terrorBooster;
              this.terrorBooster = 0;
              this.terrorDrain += remainingTime;
            }
          } else {
            this.terrorDrain += terrorDrainTime;
          }
          break;
        }
        case 2: {
          //Attack Boost (Faster Attacks)
          const atkBoostTime = Math.floor(modstr * 5 * 20 * 10);
          if (this.stopAttacks > 0) {
            if (atkBoostTime <= this.stopAttacks) this.stopAttacks -= atkBoostTime;
            else {
              const remainingTime = atkBoostTime - this.stopAttacks;
              this.stopAttacks = 0;
              this.fastAttacks += remainingTime;
            }
          } else {
            this.fastAttacks += atkBoostTime;
          }
          break;
        }
        case 3: {
          //Task Drain
          const taskDrainTime = Math.floor(modstr * 5 * 20 * 10);
          if (this.fastTasks > 0) {
            if (taskDrainTime <= this.fastTasks) this.fastTasks -= taskDrainTime;
            else {
              const remainingTime = taskDrainTime - this.fastTasks;
              this.fastTasks = 0;
              this.slowTasks += remainingTime;
            }
          } else {
            this.slowTasks += taskDrainTime;
          }
          break;
        }
        case 4: {
          //Random
          this.random += modstr;
          break;
        }
      }

      this.newEventTimerAtk = 0;
    }
    if (this.random >= 1 && Math.random() > 0.95) {
      const event = new CharityEvent("event", true, false, 10000);
      const style = Math.random() > 0.66;
      const funding = style ? Math.random() > 0.5 : false;
      event.randomize(style, funding, true);
      style ? this.waitingEvents.push(event) : this.currentEvents.push(event);
      this.random--;
    }

    this.currentEvents.forEach((e) => (CharityEventTasks[e.taskObject.name] = e.taskObject));
  }
  processBooster(boost: number, cycles: number): number {
    boost -= cycles;
    boost = Math.max(boost, 0);
    return boost;
  }
  visibilityPerCycle(): number {
    //If visibility is high, it's gain is increased.  If it's low, it's decreased.
    return 0.00000095 * Math.pow(this.visibility, 3); // * this.visibility * this.visibility;
  }
  terrorPerCycle(): number {
    //If terror is low, it's gain is increased.  If it's high, it's decreased.
    const mod = 100 - this.terror; // 1x at max terror, 1000000x at 0 terror.
    return 0.00000095 * Math.pow(mod, 3); // * mod * mod;
  }
  processNoBank(): void {
    for (const volunteer of this.volunteers) {
      //Stop them if they are doing a job that has money out.
      if (volunteer.getTask().isSpending) {
        volunteer.unassignFromTask();
      }
    }
    this.addMessage("Ran out of money!  Emergency stop engaged on all spending activity.");
  }
  updateMasterMods(): void {
    // update the master mod list
    this.masterModifiers.length = 0;

    for (const event of this.currentEvents) {
      for (const eventmod of event.modifiers) {
        let found = false;
        for (const master of this.masterModifiers) {
          if (master.area === eventmod.area) {
            master.strength += eventmod.strength;
            master.strength = Math.max(-95, master.strength);
            found = true;
            break;
          }
        }
        if (!found && eventmod.strength !== 0)
          this.masterModifiers.push(new Modifier(eventmod.area, Math.max(-95, eventmod.strength)));
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
    return Math.pow(CharityORGConstants.recruitThresholdBase, this.volunteers.length - 0.5);
  }
  recruitMember(name: string): boolean {
    name = String(name);
    if (name === "" || !this.canRecruitMember()) return false;

    // Check for already-existing names
    const sameNames = this.volunteers.filter((m) => m.name === name);
    if (sameNames.length >= 1) return false;

    const member = new CharityVolunteer(name);
    this.volunteers.push(member);
    this.addMessage("Recruited new volunteer: " + name);
    return true;
  }
  ascendMember(member: CharityVolunteer, workerScript?: WorkerScript): IAscensionResult {
    try {
      const res = member.ascend();
      this.prestige = Math.max(1, this.prestige - res.prestige);
      if (workerScript) {
        workerScript.log("charityORG.ascendVolunteer", () => `Ascended Charity volunteer ${member.name}`);
      }
      this.ascensionToken;
      this.addMessage("Ascended volunteer: " + member.name);
      this.addItemUseMessage("Ascended volunteer: " + member.name);
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
    const list1 = Object.keys(CharityVolunteerTasks).filter((taskName: string) => {
      const task = CharityVolunteerTasks[taskName];
      if (task === null) return false;
      if (task.name === "Unassigned") return false;
      return this.bank <= 0 && task.isSpending ? false : true;
    });
    const list2 = this.currentEvents.map((e) => e.taskObject.name);
    list1.push(...list2);
    return list1;
  }
  getUpgradeCost(upg: CharityVolunteerUpgrade | null): number {
    if (upg === null) {
      return Infinity;
    }
    return upg.cost;
  }
  resetBanner(): void {
    // Non-Augment bonuses
    this.luck = 0;
    this.bannerPower = 0;

    // Augment Bonuses
    this.charityAugment.mults.hacking = 1;
    this.charityAugment.mults.strength = 1;
    this.charityAugment.mults.defense = 1;
    this.charityAugment.mults.dexterity = 1;
    this.charityAugment.mults.agility = 1;
    this.charityAugment.mults.charisma = 1;
    this.charityAugment.mults.hacking_exp = 1;
    this.charityAugment.mults.strength_exp = 1;
    this.charityAugment.mults.defense_exp = 1;
    this.charityAugment.mults.dexterity_exp = 1;
    this.charityAugment.mults.agility_exp = 1;
    this.charityAugment.mults.charisma_exp = 1;
    this.charityAugment.mults.hacking_chance = 1;
    this.charityAugment.mults.hacking_speed = 1;
    this.charityAugment.mults.hacking_money = 1;
    this.charityAugment.mults.hacking_grow = 1;
    this.charityAugment.mults.company_rep = 1;
    this.charityAugment.mults.faction_rep = 1;
    this.charityAugment.mults.crime_money = 1;
    this.charityAugment.mults.crime_success = 1;
    this.charityAugment.mults.charity_money = 1;
    this.charityAugment.mults.charity_success = 1;
    this.charityAugment.mults.work_money = 1;
    this.charityAugment.mults.hacknet_node_money = 1;
    this.charityAugment.mults.hacknet_node_purchase_cost = 1;
    this.charityAugment.mults.hacknet_node_ram_cost = 1;
    this.charityAugment.mults.hacknet_node_core_cost = 1;
    this.charityAugment.mults.hacknet_node_level_cost = 1;
    this.charityAugment.mults.bladeburner_max_stamina = 1;
    this.charityAugment.mults.bladeburner_stamina_gain = 1;
    this.charityAugment.mults.bladeburner_analysis = 1;
    this.charityAugment.mults.bladeburner_success_chance = 1;

    for (const piece of this.bannerPieces) {
      this.bannerPower += piece.totalPower;

      for (const effect of piece.effects) {
        switch (effect.effect) {
          case AugmentationAreas.lucky:
            this.luck += effect.strength;
            break;
          case AugmentationAreas.hacking:
            this.charityAugment.mults.hacking += effect.strength;
            break;
          case AugmentationAreas.strength:
            this.charityAugment.mults.strength += effect.strength;
            break;
          case AugmentationAreas.defense:
            this.charityAugment.mults.defense += effect.strength;
            break;
          case AugmentationAreas.dexterity:
            this.charityAugment.mults.dexterity += effect.strength;
            break;
          case AugmentationAreas.agility:
            this.charityAugment.mults.agility += effect.strength;
            break;
          case AugmentationAreas.charisma:
            this.charityAugment.mults.charisma += effect.strength;
            break;
          case AugmentationAreas.hacking_exp:
            this.charityAugment.mults.hacking_exp += effect.strength;
            break;
          case AugmentationAreas.strength_exp:
            this.charityAugment.mults.strength_exp += effect.strength;
            break;
          case AugmentationAreas.defense_exp:
            this.charityAugment.mults.defense_exp += effect.strength;
            break;
          case AugmentationAreas.dexterity_exp:
            this.charityAugment.mults.dexterity_exp += effect.strength;
            break;
          case AugmentationAreas.agility_exp:
            this.charityAugment.mults.agility_exp += effect.strength;
            break;
          case AugmentationAreas.charisma_exp:
            this.charityAugment.mults.charisma_exp += effect.strength;
            break;
          case AugmentationAreas.hacking_chance:
            this.charityAugment.mults.hacking_chance += effect.strength;
            break;
          case AugmentationAreas.hacking_speed:
            this.charityAugment.mults.hacking_speed += effect.strength;
            break;
          case AugmentationAreas.hacking_money:
            this.charityAugment.mults.hacking_money += effect.strength;
            break;
          case AugmentationAreas.hacking_grow:
            this.charityAugment.mults.hacking_grow += effect.strength;
            break;
          case AugmentationAreas.company_rep:
            this.charityAugment.mults.company_rep += effect.strength;
            break;
          case AugmentationAreas.faction_rep:
            this.charityAugment.mults.faction_rep += effect.strength;
            break;
          case AugmentationAreas.crime_money:
            this.charityAugment.mults.crime_money += effect.strength;
            break;
          case AugmentationAreas.crime_success:
            this.charityAugment.mults.crime_success += effect.strength;
            break;
          case AugmentationAreas.charity_money:
            this.charityAugment.mults.charity_money += effect.strength;
            break;
          case AugmentationAreas.charity_success:
            this.charityAugment.mults.charity_success += effect.strength;
            break;
          case AugmentationAreas.work_money:
            this.charityAugment.mults.work_money += effect.strength;
            break;
          case AugmentationAreas.hacknet_node_money:
            this.charityAugment.mults.hacknet_node_money += effect.strength;
            break;
          case AugmentationAreas.hacknet_node_purchase_cost:
            this.charityAugment.mults.hacknet_node_purchase_cost += Math.max(effect.strength, -0.9999);
            break;
          case AugmentationAreas.hacknet_node_ram_cost:
            this.charityAugment.mults.hacknet_node_ram_cost += Math.max(effect.strength, -0.9999);
            break;
          case AugmentationAreas.hacknet_node_core_cost:
            this.charityAugment.mults.hacknet_node_core_cost += Math.max(effect.strength, -0.9999);
            break;
          case AugmentationAreas.hacknet_node_level_cost:
            this.charityAugment.mults.hacknet_node_level_cost += Math.max(effect.strength, -0.9999);
            break;
          case AugmentationAreas.bladeburner_max_stamina:
            this.charityAugment.mults.bladeburner_max_stamina += effect.strength;
            break;
          case AugmentationAreas.bladeburner_stamina_gain:
            this.charityAugment.mults.bladeburner_stamina_gain += effect.strength;
            break;
          case AugmentationAreas.bladeburner_analysis:
            this.charityAugment.mults.bladeburner_analysis += effect.strength;
            break;
          case AugmentationAreas.bladeburner_success_chance:
            this.charityAugment.mults.bladeburner_success_chance += effect.strength;
            break;
        }
      }
    }
    Player.reapplyAllAugmentations();
    Player.reapplyAllSourceFiles();
    Player.applyEntropy(Player.entropy);
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
