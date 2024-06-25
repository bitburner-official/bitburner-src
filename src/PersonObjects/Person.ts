import type { Skills } from "./Skills";
import type { HP } from "./HP";
import type { Person as IPerson } from "@nsdefs";

import * as personMethods from "./PersonMethods";
import { CityName } from "@enums";
import { PlayerOwnedAugmentation } from "../Augmentation/PlayerOwnedAugmentation";
import { calculateSkill } from "./formulas/skill";
import { defaultMultipliers } from "./Multipliers";
import { IReviverValue } from "../utils/JSONReviver";

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

  gainHackingExp = personMethods.gainHackingExp;
  gainStrengthExp = personMethods.gainStrengthExp;
  gainDefenseExp = personMethods.gainDefenseExp;
  gainDexterityExp = personMethods.gainDexterityExp;
  gainAgilityExp = personMethods.gainAgilityExp;
  gainCharismaExp = personMethods.gainCharismaExp;
  gainIntelligenceExp = personMethods.gainIntelligenceExp;
  gainStats = personMethods.gainStats;
  regenerateHp = personMethods.regenerateHp;
  updateSkillLevels = personMethods.updateSkillLevels;
  hasAugmentation = personMethods.hasAugmentation;
  calculateSkill = calculateSkill; //Class version is equal to imported version

  /** Reset all multipliers to 1 */
  resetMultipliers() {
    this.mults = defaultMultipliers();
  }

  abstract takeDamage(amt: number): boolean;
  abstract whoAmI(): string;
  abstract toJSON(): IReviverValue;
}
