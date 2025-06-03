/**
 * Sleeves are bodies that contain the player's cloned consciousness.
 * The player can use these bodies to perform different tasks synchronously.
 *
 * Each sleeve is its own individual, meaning it has its own stats/exp
 *
 * Sleeves are unlocked in BitNode-10.
 */

import type { SleevePerson } from "@nsdefs";
import type { Augmentation } from "../../Augmentation/Augmentation";
import type { SleeveWork } from "./Work/Work";

import { Player } from "@player";
import { Person } from "../Person";

import { CONSTANTS } from "../../Constants";
import {
  ClassType,
  CityName,
  CrimeType,
  FactionWorkType,
  GymType,
  LocationName,
  UniversityClassType,
  CompanyName,
  FactionName,
  BladeburnerActionType,
  BladeburnerGeneralActionName,
  AugmentationName,
  SpecialBladeburnerActionTypeForSleeve,
} from "@enums";

import { Factions } from "../../Faction/Factions";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../utils/JSONReviver";
import { SleeveClassWork } from "./Work/SleeveClassWork";
import { SleeveSynchroWork } from "./Work/SleeveSynchroWork";
import { SleeveRecoveryWork } from "./Work/SleeveRecoveryWork";
import { SleeveFactionWork } from "./Work/SleeveFactionWork";
import { SleeveCompanyWork } from "./Work/SleeveCompanyWork";
import { SleeveInfiltrateWork } from "./Work/SleeveInfiltrateWork";
import { SleeveSupportWork } from "./Work/SleeveSupportWork";
import { SleeveBladeburnerWork } from "./Work/SleeveBladeburnerWork";
import { SleeveCrimeWork } from "./Work/SleeveCrimeWork";
import { calculateIntelligenceBonus } from "../formulas/intelligence";
import { getEnumHelper } from "../../utils/EnumHelper";
import { Multipliers, mergeMultipliers } from "../Multipliers";
import { getFactionAugmentationsFiltered } from "../../Faction/FactionHelpers";
import { Augmentations } from "../../Augmentation/Augmentations";
import { getAugCost } from "../../Augmentation/AugmentationHelpers";
import type { MoneySource } from "../../utils/MoneySourceTracker";

export class Sleeve extends Person implements SleevePerson {
  currentWork: SleeveWork | null = null;

  /** Clone retains 'memory' synchronization (and maybe exp?) upon prestige/installing Augs */
  memory = 1;

  /**
   * Sleeve shock. Number between 0 and 100
   * Trauma/shock that comes with being in a sleeve. Experience earned
   * is multiplied by shock%. This gets applied before synchronization
   *
   * Reputation earned is also multiplied by shock%
   */
  shock = 100;

  /** Stored number of game "loop" cycles */
  storedCycles = 0;

  /**
   * Synchronization. Number between 0 and 100
   * When experience is earned  by sleeve, both the player and the sleeve get
   * sync% of the experience earned.
   */
  sync = 1;

  constructor() {
    super();
    this.shockRecovery();
  }

  /** Updates this object's multipliers for the given augmentation */
  applyAugmentation(aug: Augmentation): void {
    this.mults = mergeMultipliers(this.mults, aug.mults);
  }

  findPurchasableAugs(): Augmentation[] {
    // You can only purchase Augmentations that are actually available from
    // your factions. I.e. you must be in a faction that has the Augmentation
    // and you must also have enough rep in that faction in order to purchase it.

    const ownedAugNames = this.augmentations.map((e) => e.name);
    const availableAugs: Augmentation[] = [];

    // Helper function that helps filter out augs that are already owned
    // and augs that aren't allowed for sleeves
    function isAvailableForSleeve(aug: Augmentation): boolean {
      if (ownedAugNames.includes(aug.name)) return false;
      if (availableAugs.includes(aug)) return false;
      if (aug.isSpecial) return false;

      type MultKey = keyof Multipliers;
      const validMults: MultKey[] = [
        "hacking",
        "strength",
        "defense",
        "dexterity",
        "agility",
        "charisma",
        "hacking_exp",
        "strength_exp",
        "defense_exp",
        "dexterity_exp",
        "agility_exp",
        "charisma_exp",
        "company_rep",
        "faction_rep",
        "crime_money",
        "crime_success",
        "work_money",
      ];
      for (const mult of validMults) {
        if (aug.mults[mult] !== 1) return true;
      }

      return false;
    }

    // If player is in a gang, then we return all augs that the player
    // has enough reputation for (since that gang offers all augs)
    if (Player.gang) {
      const fac = Player.getGangFaction();
      const gangAugs = getFactionAugmentationsFiltered(fac);

      for (const augName of gangAugs) {
        const aug = Augmentations[augName];
        if (!isAvailableForSleeve(aug)) continue;

        if (fac.playerReputation > getAugCost(aug).repCost) {
          availableAugs.push(aug);
        }
      }
    }

    for (const facName of Player.factions) {
      if (facName === FactionName.Bladeburners) continue;
      if (facName === FactionName.Netburners) continue;
      const fac = Factions[facName];
      if (!fac) continue;

      for (const augName of fac.augmentations) {
        const aug = Augmentations[augName];
        if (!isAvailableForSleeve(aug)) continue;

        if (fac.playerReputation > getAugCost(aug).repCost) {
          availableAugs.push(aug);
        }
      }
    }

    // Add the stanek sleeve aug
    if (!ownedAugNames.includes(AugmentationName.ZOE) && Player.factions.includes(FactionName.ChurchOfTheMachineGod)) {
      const aug = Augmentations[AugmentationName.ZOE];
      availableAugs.push(aug);
    }

    return availableAugs;
  }

  shockBonus(): number {
    return (100 - this.shock) / 100;
  }

  syncBonus(): number {
    return this.sync / 100;
  }

  startWork(w: SleeveWork): void {
    if (this.currentWork) this.currentWork.finish();
    this.currentWork = w;
  }

  stopWork(): void {
    if (this.currentWork) this.currentWork.finish();
    this.currentWork = null;
  }

  /** Commit crimes */
  commitCrime(type: CrimeType) {
    this.startWork(new SleeveCrimeWork(type));
    return true;
  }

  /** Returns the cost of upgrading this sleeve's memory by a certain amount */
  getMemoryUpgradeCost(n: number): number {
    const amt = Math.round(n);
    if (amt < 0) {
      return 0;
    }

    if (this.memory + amt > 100) {
      return this.getMemoryUpgradeCost(100 - this.memory);
    }

    const mult = 1.02;
    const baseCost = 1e12;
    let currCost = 0;
    let currMemory = this.memory - 1;
    for (let i = 0; i < n; ++i) {
      currCost += Math.pow(mult, currMemory);
      ++currMemory;
    }

    return currCost * baseCost;
  }

  installAugmentation(aug: Augmentation): void {
    this.exp.hacking = 0;
    this.exp.strength = 0;
    this.exp.defense = 0;
    this.exp.dexterity = 0;
    this.exp.agility = 0;
    this.exp.charisma = 0;
    this.applyAugmentation(aug);
    this.augmentations.push({ name: aug.name, level: 1 });
    this.updateSkillLevels();
  }

  /** Called on every sleeve for a Source File Prestige */
  prestige(): void {
    // Reset augs and multipliers
    this.augmentations = [];
    this.resetMultipliers();

    // Reset exp
    this.exp.hacking = 0;
    this.exp.strength = 0;
    this.exp.defense = 0;
    this.exp.dexterity = 0;
    this.exp.agility = 0;
    this.exp.charisma = 0;
    this.updateSkillLevels();
    this.hp.current = this.hp.max;

    // Reset task-related stuff
    this.stopWork();
    this.shockRecovery();

    // Reset Location
    this.city = CityName.Sector12;

    // Reset sleeve-related stats
    this.shock = 100;
    this.storedCycles = 0;
    this.sync = Math.max(this.memory, 1);
  }

  /**
   * Process loop
   * Returns an object containing the amount of experience that should be
   * transferred to all other sleeves
   */
  process(numCycles = 1): void {
    // Only process once every second (5 cycles)
    const CyclesPerSecond = 1000 / CONSTANTS.MilliPerCycle;
    this.storedCycles += numCycles;
    if (this.storedCycles < CyclesPerSecond || !this.currentWork) return;
    const cyclesUsed = Math.min(this.storedCycles, 15);
    this.shock = Math.max(
      0,
      this.shock - 0.0001 * calculateIntelligenceBonus(this.skills.intelligence, 0.75) * cyclesUsed,
    );
    this.currentWork.process(this, cyclesUsed);
    this.storedCycles -= cyclesUsed;
  }

  shockRecovery(): boolean {
    this.startWork(new SleeveRecoveryWork());
    return true;
  }

  synchronize(): boolean {
    this.startWork(new SleeveSynchroWork());
    return true;
  }

  /** Take a course at a university */
  takeUniversityCourse(universityName: string, className: UniversityClassType): boolean {
    // Set exp/money multipliers based on which university.
    // Also check that the sleeve is in the right city
    let loc: LocationName | undefined;
    switch (universityName) {
      case LocationName.AevumSummitUniversity: {
        if (this.city !== CityName.Aevum) return false;
        loc = LocationName.AevumSummitUniversity;
        break;
      }
      case LocationName.Sector12RothmanUniversity: {
        if (this.city !== CityName.Sector12) return false;
        loc = LocationName.Sector12RothmanUniversity;
        break;
      }
      case LocationName.VolhavenZBInstituteOfTechnology: {
        if (this.city !== CityName.Volhaven) return false;
        loc = LocationName.VolhavenZBInstituteOfTechnology;
        break;
      }
    }
    if (!loc) return false;

    // Set experience/money gains based on class
    let classType: ClassType | undefined;
    switch (className) {
      case ClassType.computerScience:
        classType = UniversityClassType.computerScience;
        break;
      case ClassType.dataStructures:
        classType = UniversityClassType.dataStructures;
        break;
      case ClassType.networks:
        classType = UniversityClassType.networks;
        break;
      case ClassType.algorithms:
        classType = UniversityClassType.algorithms;
        break;
      case ClassType.management:
        classType = UniversityClassType.management;
        break;
      case ClassType.leadership:
        classType = UniversityClassType.leadership;
        break;
    }
    if (!classType) return false;

    this.startWork(
      new SleeveClassWork({
        classType: classType,
        location: loc,
      }),
    );
    return true;
  }

  tryBuyAugmentation(aug: Augmentation): boolean {
    if (!Player.canAfford(aug.baseCost)) {
      return false;
    }

    // Verify that this sleeve does not already have that augmentation.
    if (this.hasAugmentation(aug.name)) return false;

    // Verify that the augmentation is available for purchase.
    if (!this.findPurchasableAugs().includes(aug)) return false;

    Player.loseMoney(aug.baseCost, "sleeves");
    this.installAugmentation(aug);
    return true;
  }

  upgradeMemory(n: number): void {
    this.memory = Math.min(100, Math.round(this.memory + n));
  }

  /**
   * Start work for one of the player's companies
   * Returns boolean indicating success
   */
  workForCompany(companyName: CompanyName): boolean {
    const companyPositionName = Player.jobs[companyName];
    if (!companyPositionName) return false;

    this.startWork(new SleeveCompanyWork(companyName));
    return true;
  }

  workForFaction(factionName: FactionName, workType: FactionWorkType): boolean {
    const faction = Factions[factionName];
    const factionInfo = faction.getInfo();

    switch (workType) {
      case FactionWorkType.field:
        if (!factionInfo.offerFieldWork) return false;
        break;
      case FactionWorkType.hacking:
        if (!factionInfo.offerHackingWork) return false;
        break;
      case FactionWorkType.security:
        if (!factionInfo.offerSecurityWork) return false;
        break;
    }

    this.startWork(
      new SleeveFactionWork({
        factionWorkType: workType,
        factionName: factionName,
      }),
    );

    return true;
  }

  /** Begin a gym workout task */
  workoutAtGym(gymName: string, stat: GymType): boolean {
    // Check that the sleeve is in the right city
    let loc: LocationName | undefined;
    switch (gymName) {
      case LocationName.AevumCrushFitnessGym: {
        if (this.city !== CityName.Aevum) return false;
        loc = LocationName.AevumCrushFitnessGym;
        break;
      }
      case LocationName.AevumSnapFitnessGym: {
        if (this.city !== CityName.Aevum) return false;
        loc = LocationName.AevumSnapFitnessGym;
        break;
      }
      case LocationName.Sector12IronGym: {
        if (this.city !== CityName.Sector12) return false;
        loc = LocationName.Sector12IronGym;
        break;
      }
      case LocationName.Sector12PowerhouseGym: {
        if (this.city !== CityName.Sector12) return false;
        loc = LocationName.Sector12PowerhouseGym;
        break;
      }
      case LocationName.VolhavenMilleniumFitnessGym: {
        if (this.city !== CityName.Volhaven) return false;
        loc = LocationName.VolhavenMilleniumFitnessGym;
        break;
      }
    }
    if (!loc) return false;

    this.startWork(
      new SleeveClassWork({
        classType: stat,
        location: loc,
      }),
    );

    return true;
  }

  /** Begin a bladeburner task */
  bladeburner(action: string, contract?: string): boolean {
    if (!Player.bladeburner) return false;
    switch (action) {
      case BladeburnerGeneralActionName.Training:
        this.startWork(
          new SleeveBladeburnerWork({
            actionId: { type: BladeburnerActionType.General, name: BladeburnerGeneralActionName.Training },
          }),
        );
        return true;
      case BladeburnerGeneralActionName.FieldAnalysis:
        this.startWork(
          new SleeveBladeburnerWork({
            actionId: { type: BladeburnerActionType.General, name: BladeburnerGeneralActionName.FieldAnalysis },
          }),
        );
        return true;
      case BladeburnerGeneralActionName.Recruitment:
        this.startWork(
          new SleeveBladeburnerWork({
            actionId: { type: BladeburnerActionType.General, name: BladeburnerGeneralActionName.Recruitment },
          }),
        );
        return true;
      case BladeburnerGeneralActionName.Diplomacy:
        this.startWork(
          new SleeveBladeburnerWork({
            actionId: { type: BladeburnerActionType.General, name: BladeburnerGeneralActionName.Diplomacy },
          }),
        );
        return true;
      case BladeburnerGeneralActionName.HyperbolicRegen:
        this.startWork(
          new SleeveBladeburnerWork({
            actionId: { type: BladeburnerActionType.General, name: BladeburnerGeneralActionName.HyperbolicRegen },
          }),
        );
        return true;
      case SpecialBladeburnerActionTypeForSleeve.InfiltrateSynthoids:
        this.startWork(new SleeveInfiltrateWork());
        return true;
      case SpecialBladeburnerActionTypeForSleeve.SupportMainSleeve:
        this.startWork(new SleeveSupportWork());
        return true;
      case SpecialBladeburnerActionTypeForSleeve.TakeOnContracts:
        if (!getEnumHelper("BladeburnerContractName").isMember(contract)) return false;
        this.startWork(
          new SleeveBladeburnerWork({ actionId: { type: BladeburnerActionType.Contract, name: contract } }),
        );
        return true;
    }
    return false;
  }

  travelCostMoneySource(): MoneySource {
    return "sleeves";
  }

  /** Sleeves are immortal, but we damage them for max hp so they get shocked */
  kill() {
    return this.takeDamage(this.hp.max);
  }

  takeDamage(amt: number): boolean {
    if (typeof amt !== "number") {
      console.warn(`Player.takeDamage() called without a numeric argument: ${amt}`);
      return false;
    }

    this.hp.current -= amt;
    if (this.hp.current <= 0) {
      this.shock = Math.min(100, this.shock + 0.5);
      this.hp.current = this.hp.max;
      return true;
    } else {
      return false;
    }
  }

  static recalculateNumOwned() {
    /**
     * Don't change sourceFileLvl to activeSourceFileLvl. The number of sleeves is a permanent effect. It's too
     * troublesome for the player if they lose Sleeves and have to go BN10 to buy them again when they override the
     * level of SF 10.
     */
    const numSleeves =
      Math.min(3, Player.sourceFileLvl(10) + (Player.bitNodeN === 10 ? 1 : 0)) + Player.sleevesFromCovenant;
    while (Player.sleeves.length > numSleeves) {
      const destroyedSleeve = Player.sleeves.pop();
      // This should not happen, but avoid an infinite loop in case sleevesFromCovenent or sf10 level are somehow negative
      if (!destroyedSleeve) return;
      // Stop work, to prevent destroyed sleeves from continuing their tasks in the void
      destroyedSleeve.stopWork();
    }
    while (Player.sleeves.length < numSleeves) Player.sleeves.push(new Sleeve());
  }

  whoAmI(): string {
    return "Sleeve";
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("Sleeve", this);
  }

  /** Initializes a Sleeve object from a JSON save state. */
  static fromJSON(value: IReviverValue): Sleeve {
    const sleeve = Generic_fromJSON(Sleeve, value.data);
    if (!sleeve.hp?.current || !sleeve.hp?.max) sleeve.hp = { current: 10, max: 10 };
    // Remove any invalid aug names on game load
    sleeve.augmentations = sleeve.augmentations.filter((ownedAug) =>
      getEnumHelper("AugmentationName").isMember(ownedAug.name),
    );
    sleeve.queuedAugmentations = sleeve.queuedAugmentations.filter((ownedAug) =>
      getEnumHelper("AugmentationName").isMember(ownedAug.name),
    );

    return sleeve;
  }
}

constructorsForReviver.Sleeve = Sleeve;
