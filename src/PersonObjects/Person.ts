import type { Skills } from "./Skills";
import type { HP } from "./HP";
import type { Person as IPerson } from "@nsdefs"; // Importing Person interface from namespace @nsdefs

import * as personMethods from "./PersonMethods"; // Importing methods for managing person-related actions
import { CityName } from "@enums"; // Importing CityName enum
import { PlayerOwnedAugmentation } from "../Augmentation/PlayerOwnedAugmentation"; // Importing PlayerOwnedAugmentation class
import { calculateSkill } from "./formulas/skill"; // Importing function for calculating skill levels
import { defaultMultipliers } from "./Multipliers"; // Importing default multipliers
import { IReviverValue } from "../utils/JSONReviver"; // Importing interface for JSON reviver values

// Base class representing a person-like object
export abstract class Person implements IPerson {
  hp: HP = { current: 10, max: 10 }; // Current and maximum hit points of the person.

  // Skills possessed by the person by level.
  skills: Skills = {
    hacking: 1,
    strength: 1,
    defense: 1,
    dexterity: 1,
    agility: 1,
    charisma: 1,
    intelligence: 0,
  };

  // Experience gained towards each skill.
  exp: Skills = {
    hacking: 0,
    strength: 0,
    defense: 0,
    dexterity: 0,
    agility: 0,
    charisma: 0,
    intelligence: 0,
  };

// Multipliers affecting various actions and attributes, represents skills gained and new speeds / rates because of these skills.
mults = defaultMultipliers();

/** Augmentations */
augmentations: PlayerOwnedAugmentation[] = []; // List of augmentations owned by the person
queuedAugmentations: PlayerOwnedAugmentation[] = []; // List of augmentations queued for installation by the person

/** City that the person is in, Sector12 by default */
city: CityName = CityName.Sector12;

// Methods that increment experience levels towards each skill type.
gainHackingExp = personMethods.gainHackingExp;
gainStrengthExp = personMethods.gainStrengthExp;
gainDefenseExp = personMethods.gainDefenseExp;
gainDexterityExp = personMethods.gainDexterityExp;
gainAgilityExp = personMethods.gainAgilityExp;
gainCharismaExp = personMethods.gainCharismaExp;
gainIntelligenceExp = personMethods.gainIntelligenceExp;
gainStats = personMethods.gainStats;
regenerateHp = personMethods.regenerateHp;
queryStatFromString = personMethods.queryStatFromString;
updateSkillLevels = personMethods.updateSkillLevels;
hasAugmentation = personMethods.hasAugmentation;
calculateSkill = calculateSkill; //Class version is equal to imported version

/** Reset all multipliers to 1 */
resetMultipliers() {
  this.mults = defaultMultipliers();
}

// Abstract method for taking damage amount amt. Returns true if person is alive after damage and false otherwise.
abstract takeDamage(amt: number): boolean;

// Abstract method for identifying the person.
// Returns A string representing the person's identity.
abstract whoAmI(): string;

// Abstract method for serializing the person to JSON format.
// Returns The serialized representation of the person.
abstract toJSON(): IReviverValue;
}