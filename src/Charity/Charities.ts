import { Charity } from "./Charity";
import { CONSTANTS } from "../Constants";
import { CharityType } from "@enums";

export const Charities: Record<CharityType, Charity> = {
  [CharityType.stopRobery]: new Charity(
    "to stop a robery",
    "Attempt to stop an armed robbery on a high-end store",
    CharityType.stopRobery,
    60e3, // Time
    400e3, // Money
    1 / 5, // Difficulty
    -0.5, // Karma
    {
      hacking_exp: 30,
      dexterity_exp: 45,
      agility_exp: 45,

      hacking_success_weight: 0.5,
      dexterity_success_weight: 2,
      agility_success_weight: 1,

      intelligence_exp: 7.5 * CONSTANTS.IntelligenceCharityBaseExpGain,
    },
  ),

  [CharityType.hugSomeoneInNeed]: new Charity(
    "to hug someone in need",
    "Attempt to hug a random person that looks down",
    CharityType.hugSomeoneInNeed,
    4e3,
    36e3,
    1 / 5,
    -0.25,
    {
      strength_exp: 3,
      defense_exp: 3,
      dexterity_exp: 3,
      agility_exp: 3,

      strength_success_weight: 1.5,
      defense_success_weight: 0.5,
      dexterity_success_weight: 1.5,
      agility_success_weight: 0.5,
    },
  ),

  [CharityType.helpPolice]: new Charity(
    "help police",
    "Attempt to help a police officer being overpowered",
    CharityType.helpPolice,
    90e3,
    800e3,
    1 / 3,
    -1.5,
    {
      hacking_exp: 45,
      dexterity_exp: 60,
      agility_exp: 60,

      hacking_success_weight: 0.5,
      dexterity_success_weight: 1,
      agility_success_weight: 1,

      intelligence_exp: 15 * CONSTANTS.IntelligenceCharityBaseExpGain,
    },
  ),

  [CharityType.workAtSoupKitchen]: new Charity(
    "to work at a soup kitchen",
    "Find a soup kitchen to work at",
    CharityType.workAtSoupKitchen,
    10e3,
    120e3,
    1,
    -0.5,
    {
      dexterity_exp: 5,
      agility_exp: 5,
      charisma_exp: 10,

      charisma_success_weight: 3,
      dexterity_success_weight: 2,
      agility_success_weight: 1,
    },
  ),

  [CharityType.reportDrugDeal]: new Charity(
    "report a drug deal",
    "Attempt to report a drug deal",
    CharityType.reportDrugDeal,
    300e3,
    4.5e6,
    1 / 2,
    -0.1,
    {
      hacking_exp: 100,
      dexterity_exp: 150,
      charisma_exp: 15,

      hacking_success_weight: 0.05,
      dexterity_success_weight: 1.25,

      intelligence_exp: 60 * CONSTANTS.IntelligenceCharityBaseExpGain,
    },
  ),

  [CharityType.takeKnife]: new Charity(
    "take a knife",
    "Attempt to stop the stabbing of someone",
    CharityType.takeKnife,
    3e3,
    45e3,
    1,
    -3,
    {
      strength_exp: 2,
      defense_exp: 2,
      dexterity_exp: 2,
      agility_exp: 2,

      strength_success_weight: 2,
      defense_success_weight: 2,
      dexterity_success_weight: 0.5,
      agility_success_weight: 0.5,

      saves: 1,
    },
  ),

  [CharityType.payItForward]: new Charity(
    "pay it forward",
    "Attempt to pay forward a favor done to you earlier",
    CharityType.payItForward,
    80e3,
    1.6e6,
    8,
    -5,
    {
      strength_exp: 20,
      defense_exp: 20,
      dexterity_exp: 20,
      agility_exp: 80,
      charisma_exp: 40,

      hacking_success_weight: 1,
      strength_success_weight: 1,
      dexterity_success_weight: 4,
      agility_success_weight: 2,
      charisma_success_weight: 2,

      intelligence_exp: 16 * CONSTANTS.IntelligenceCharityBaseExpGain,
    },
  ),

  [CharityType.patroleTheStreets]: new Charity(
    "to patrol the streets",
    "Attempt to patrol the streets to stop anything unwarranted from happening",
    CharityType.patroleTheStreets,
    120e3,
    3.6e6,
    5,
    -6,
    {
      strength_exp: 80,
      defense_exp: 80,
      dexterity_exp: 80,
      agility_exp: 80,
      charisma_exp: 80,

      charisma_success_weight: 1,
      strength_success_weight: 1,
      dexterity_success_weight: 1,
      agility_success_weight: 1,

      intelligence_exp: 26 * CONSTANTS.IntelligenceCharityBaseExpGain,
    },
  ),

  [CharityType.giveBack]: new Charity(
    "to give back",
    "Attempt to give back to the community",
    CharityType.giveBack,
    300e3,
    12e6,
    8,
    -10,
    {
      strength_exp: 300,
      defense_exp: 300,
      dexterity_exp: 300,
      agility_exp: 300,

      strength_success_weight: 1,
      dexterity_success_weight: 2,
      agility_success_weight: 1,

      intelligence_exp: 65 * CONSTANTS.IntelligenceCharityBaseExpGain,

      saves: 1,
    },
  ),

  [CharityType.holdFundRaiser]: new Charity(
    "a fund raiser",
    "Attempt to pull off a fund raiser",
    CharityType.holdFundRaiser,
    600e3,
    120e6,
    18,
    -15,
    {
      hacking_exp: 450,
      strength_exp: 450,
      defense_exp: 450,
      dexterity_exp: 450,
      agility_exp: 450,
      charisma_exp: 450,

      hacking_success_weight: 1,
      strength_success_weight: 1,
      defense_success_weight: 1,
      dexterity_success_weight: 1,
      agility_success_weight: 1,
      charisma_success_weight: 1,

      intelligence_exp: 130 * CONSTANTS.IntelligenceCharityBaseExpGain,
    },
  ),
};
