import type { Skills } from "./Skills";
import type { HP } from "./HP";
import type { Person as IPerson, WorkStats } from "@nsdefs";

import { CityName } from "@enums";
import { PlayerOwnedAugmentation } from "../Augmentation/PlayerOwnedAugmentation";
import { calculateSkill } from "./formulas/skill";
import { defaultMultipliers } from "./Multipliers";
import { IReviverValue } from "../utils/JSONReviver";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Player } from "../Player";
import { CONSTANTS } from "../Constants";
import { PlayerObject } from "./Player/PlayerObject";

// Base class representing a person-like object
export abstract class Person implements IPerson {
  hp: HP = { current: 10, max: 10 };
  skills: Skills = {
    hacking: 1,
    strength: 1,
    defense: 1,
    dexterity: 1,
    agility: 1,
    charisma: 1,
    intelligence: 0,
  };
  exp: Skills = {
    hacking: 0,
    strength: 0,
    defense: 0,
    dexterity: 0,
    agility: 0,
    charisma: 0,
    intelligence: 0,
  };

  mults = defaultMultipliers();

  /** Augmentations */
  augmentations: PlayerOwnedAugmentation[] = [];
  queuedAugmentations: PlayerOwnedAugmentation[] = [];

  /** City that the person is in */
  city: CityName = CityName.Sector12;

  gainHackingExp(exp: number): void {
    if (isNaN(exp)) {
      console.error("ERR: NaN passed into Player.gainHackingExp()");
      return;
    }
    this.exp.hacking += exp;
    if (this.exp.hacking < 0) {
      this.exp.hacking = 0;
    }

    this.skills.hacking = calculateSkill(
      this.exp.hacking,
      this.mults.hacking * currentNodeMults.HackingLevelMultiplier,
    );
  }

  gainStrengthExp(exp: number): void {
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

  gainDefenseExp(exp: number): void {
    if (isNaN(exp)) {
      console.error("ERR: NaN passed into player.gainDefenseExp()");
      return;
    }
    this.exp.defense += exp;
    if (this.exp.defense < 0) {
      this.exp.defense = 0;
    }

    this.skills.defense = calculateSkill(
      this.exp.defense,
      this.mults.defense * currentNodeMults.DefenseLevelMultiplier,
    );
    const ratio = this.hp.current / this.hp.max;
    this.hp.max = Math.floor(10 + this.skills.defense / 10);
    this.hp.current = Math.round(this.hp.max * ratio);
  }

  gainDexterityExp(exp: number): void {
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

  gainAgilityExp(exp: number): void {
    if (isNaN(exp)) {
      console.error("ERR: NaN passed into Player.gainAgilityExp()");
      return;
    }
    this.exp.agility += exp;
    if (this.exp.agility < 0) {
      this.exp.agility = 0;
    }

    this.skills.agility = calculateSkill(
      this.exp.agility,
      this.mults.agility * currentNodeMults.AgilityLevelMultiplier,
    );
  }

  gainCharismaExp(exp: number): void {
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

  gainIntelligenceExp(exp: number): void {
    if (isNaN(exp)) {
      console.error("ERROR: NaN passed into Player.gainIntelligenceExp()");
      return;
    }
    if (Player.sourceFileLvl(5) > 0 || this.skills.intelligence > 0 || Player.bitNodeN === 5) {
      this.exp.intelligence += exp;
      this.skills.intelligence = Math.floor(this.calculateSkill(this.exp.intelligence, 1));
    }
  }

  gainStats(retValue: WorkStats): void {
    this.gainHackingExp(retValue.hackExp * this.mults.hacking_exp);
    this.gainStrengthExp(retValue.strExp * this.mults.strength_exp);
    this.gainDefenseExp(retValue.defExp * this.mults.defense_exp);
    this.gainDexterityExp(retValue.dexExp * this.mults.dexterity_exp);
    this.gainAgilityExp(retValue.agiExp * this.mults.agility_exp);
    this.gainCharismaExp(retValue.chaExp * this.mults.charisma_exp);
    this.gainIntelligenceExp(retValue.intExp);
  }

  regenerateHp(amt: number): void {
    if (typeof amt !== "number") {
      console.warn(`Player.regenerateHp() called without a numeric argument: ${amt}`);
      return;
    }
    this.hp.current += amt;
    if (this.hp.current > this.hp.max) {
      this.hp.current = this.hp.max;
    }
  }

  updateSkillLevels(this: Person): void {
    this.skills.hacking = Math.max(
      1,
      Math.floor(this.calculateSkill(this.exp.hacking, this.mults.hacking * currentNodeMults.HackingLevelMultiplier)),
    );
    this.skills.strength = Math.max(
      1,
      Math.floor(
        this.calculateSkill(this.exp.strength, this.mults.strength * currentNodeMults.StrengthLevelMultiplier),
      ),
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
      Math.floor(
        this.calculateSkill(this.exp.charisma, this.mults.charisma * currentNodeMults.CharismaLevelMultiplier),
      ),
    );

    const ratio: number = Math.min(this.hp.current / this.hp.max, 1);
    this.hp.max = Math.floor(10 + this.skills.defense / 10);
    this.hp.current = Math.round(this.hp.max * ratio);
  }

  hasAugmentation(augName: string, ignoreQueued = false) {
    if (this.augmentations.some((a) => a.name === augName)) {
      return true;
    }
    if (!ignoreQueued && this.queuedAugmentations.some((a) => a.name === augName)) {
      return true;
    }
    return false;
  }

  travel(cityName: CityName): boolean {
    if (!Player.canAfford(CONSTANTS.TravelCost)) {
      return false;
    }

    Player.loseMoney(CONSTANTS.TravelCost, this instanceof PlayerObject ? "other" : "sleeves");
    this.city = cityName;

    return true;
  }

  calculateSkill = calculateSkill; //Class version is equal to imported version

  /** Reset all multipliers to 1 */
  resetMultipliers() {
    this.mults = defaultMultipliers();
  }

  abstract takeDamage(amt: number): boolean;
  abstract whoAmI(): string;
  abstract toJSON(): IReviverValue;
}
