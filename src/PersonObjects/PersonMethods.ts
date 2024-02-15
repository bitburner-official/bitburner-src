import { Person } from "./Person"; // Importing the Person class
import { calculateSkill } from "./formulas/skill"; // Importing function for calculating skill levels
import { currentNodeMults } from "../BitNode/BitNodeMultipliers"; // Importing current node multipliers
import { Player } from "@player"; // Importing Player class
import { WorkStats } from "@nsdefs"; // Importing WorkStats interface from namespace @nsdefs

// The following 7 methods increment specific experience types for a Person object, incrementing by number.
// If a number is not input a concole error is thrown. If the experience goes below 0 it is reset to 0.
// Then skills are recalculated based on the change.

export function gainHackingExp(this: Person, exp: number): void {
  if (isNaN(exp)) {
    console.error("ERR: NaN passed into Player.gainHackingExp()");
    return;
  }
  this.exp.hacking += exp;
  if (this.exp.hacking < 0) {
    this.exp.hacking = 0;
  }

  this.skills.hacking = calculateSkill(this.exp.hacking, this.mults.hacking * currentNodeMults.HackingLevelMultiplier);
}

export function gainStrengthExp(this: Person, exp: number): void {
  if (isNaN(exp)) {
    console.error("ERR: NaN passed into Player.gainStrengthExp()");
    return;
  }
  this.exp.strength += exp;
  if (this.exp.strength < 0) {
    this.exp.strength = 0;
  }

  this.skills.strength = calculateSkill(
    this.exp.strength,
    this.mults.strength * currentNodeMults.StrengthLevelMultiplier,
  );
}

export function gainDefenseExp(this: Person, exp: number): void {
  if (isNaN(exp)) {
    console.error("ERR: NaN passed into player.gainDefenseExp()");
    return;
  }
  this.exp.defense += exp;
  if (this.exp.defense < 0) {
    this.exp.defense = 0;
  }

  this.skills.defense = calculateSkill(this.exp.defense, this.mults.defense * currentNodeMults.DefenseLevelMultiplier);
  const ratio = this.hp.current / this.hp.max;
  this.hp.max = Math.floor(10 + this.skills.defense / 10);
  this.hp.current = Math.round(this.hp.max * ratio);
}

export function gainDexterityExp(this: Person, exp: number): void {
  if (isNaN(exp)) {
    console.error("ERR: NaN passed into Player.gainDexterityExp()");
    return;
  }
  this.exp.dexterity += exp;
  if (this.exp.dexterity < 0) {
    this.exp.dexterity = 0;
  }

  this.skills.dexterity = calculateSkill(
    this.exp.dexterity,
    this.mults.dexterity * currentNodeMults.DexterityLevelMultiplier,
  );
}

export function gainAgilityExp(this: Person, exp: number): void {
  if (isNaN(exp)) {
    console.error("ERR: NaN passed into Player.gainAgilityExp()");
    return;
  }
  this.exp.agility += exp;
  if (this.exp.agility < 0) {
    this.exp.agility = 0;
  }

  this.skills.agility = calculateSkill(this.exp.agility, this.mults.agility * currentNodeMults.AgilityLevelMultiplier);
}

export function gainCharismaExp(this: Person, exp: number): void {
  if (isNaN(exp)) {
    console.error("ERR: NaN passed into Player.gainCharismaExp()");
    return;
  }
  this.exp.charisma += exp;
  if (this.exp.charisma < 0) {
    this.exp.charisma = 0;
  }

  this.skills.charisma = calculateSkill(
    this.exp.charisma,
    this.mults.charisma * currentNodeMults.CharismaLevelMultiplier,
  );
}

export function gainIntelligenceExp(this: Person, exp: number): void {
  if (isNaN(exp)) {
    console.error("ERROR: NaN passed into Player.gainIntelligenceExp()");
    return;
  }
  if (Player.sourceFileLvl(5) > 0 || this.skills.intelligence > 0 || Player.bitNodeN === 5) {
    this.exp.intelligence += exp;
    this.skills.intelligence = Math.floor(this.calculateSkill(this.exp.intelligence, 1));
  }
}

// Increases all skills' experience based on the given WorkStats and updates the corresponding skill levels.
// @param retValue - The WorkStats object containing experience gains for each skill. 
export function gainStats(this: Person, retValue: WorkStats): void {
  this.gainHackingExp(retValue.hackExp * this.mults.hacking_exp);
  this.gainStrengthExp(retValue.strExp * this.mults.strength_exp);
  this.gainDefenseExp(retValue.defExp * this.mults.defense_exp);
  this.gainDexterityExp(retValue.dexExp * this.mults.dexterity_exp);
  this.gainAgilityExp(retValue.agiExp * this.mults.agility_exp);
  this.gainCharismaExp(retValue.chaExp * this.mults.charisma_exp);
  this.gainIntelligenceExp(retValue.intExp);
}

//Given a string expression like "str" or "strength", returns the given stat
export function queryStatFromString(this: Person, str: string): number {
  const tempStr = str.toLowerCase();
  if (tempStr.includes("hack")) {
    return this.skills.hacking;
  }
  if (tempStr.includes("str")) {
    return this.skills.strength;
  }
  if (tempStr.includes("def")) {
    return this.skills.defense;
  }
  if (tempStr.includes("dex")) {
    return this.skills.dexterity;
  }
  if (tempStr.includes("agi")) {
    return this.skills.agility;
  }
  if (tempStr.includes("cha")) {
    return this.skills.charisma;
  }
  if (tempStr.includes("int")) {
    return this.skills.intelligence;
  }
  return 0;
}

// Regenerates the person's hit points by the specified amount.
export function regenerateHp(this: Person, amt: number): void {
  if (typeof amt !== "number") {
    console.warn(`Player.regenerateHp() called without a numeric argument: ${amt}`);
    return;
  }
  this.hp.current += amt;
  if (this.hp.current > this.hp.max) {
    this.hp.current = this.hp.max;
  }
}

// Updates all skill levels of the person based on experience points and multipliers.
export function updateSkillLevels(this: Person): void {
  this.skills.hacking = Math.max(
    1,
    Math.floor(this.calculateSkill(this.exp.hacking, this.mults.hacking * currentNodeMults.HackingLevelMultiplier)),
  );
  this.skills.strength = Math.max(
    1,
    Math.floor(this.calculateSkill(this.exp.strength, this.mults.strength * currentNodeMults.StrengthLevelMultiplier)),
  );
  this.skills.defense = Math.max(
    1,
    Math.floor(this.calculateSkill(this.exp.defense, this.mults.defense * currentNodeMults.DefenseLevelMultiplier)),
  );
  this.skills.dexterity = Math.max(
    1,
    Math.floor(
      this.calculateSkill(this.exp.dexterity, this.mults.dexterity * currentNodeMults.DexterityLevelMultiplier),
    ),
  );
  this.skills.agility = Math.max(
    1,
    Math.floor(this.calculateSkill(this.exp.agility, this.mults.agility * currentNodeMults.AgilityLevelMultiplier)),
  );
  this.skills.charisma = Math.max(
    1,
    Math.floor(this.calculateSkill(this.exp.charisma, this.mults.charisma * currentNodeMults.CharismaLevelMultiplier)),
  );

  const ratio: number = Math.min(this.hp.current / this.hp.max, 1);
  this.hp.max = Math.floor(10 + this.skills.defense / 10);
  this.hp.current = Math.round(this.hp.max * ratio);
}

// Checks if Person has augmentation augName. ignoredQueue dictates whether augmentations queued for install are ignored.
export function hasAugmentation(this: Person, augName: string, ignoreQueued = false) {
  if (this.augmentations.some((a) => a.name === augName)) {
    return true;
  }
  if (!ignoreQueued && this.queuedAugmentations.some((a) => a.name === augName)) {
    return true;
  }
  return false;
}