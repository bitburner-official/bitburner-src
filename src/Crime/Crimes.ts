import { Crime } from "./Crime";
import { CONSTANTS } from "../Constants";
import { CrimeType, CrimeTypes } from "../Enums";

export const Crimes: Record<CrimeType, Crime> = {
  [CrimeTypes.shoplift]: new Crime(
    "to shoplift",
    "Attempt to shoplift from a low-end retailer",
    CrimeTypes.shoplift,
    2e3,
    15e3,
    1 / 20,
    0.1,
    {
      dexterity_success_weight: 1,
      agility_success_weight: 1,

      dexterity_exp: 2,
      agility_exp: 2,
    },
  ),

  [CrimeTypes.robStore]: new Crime(
    "to rob a store",
    "Attempt to commit armed robbery on a high-end store",
    CrimeTypes.robStore,
    60e3,
    400e3,
    1 / 5,
    0.5,
    {
      hacking_exp: 30,
      dexterity_exp: 45,
      agility_exp: 45,

      hacking_success_weight: 0.5,
      dexterity_success_weight: 2,
      agility_success_weight: 1,

      intelligence_exp: 7.5 * CONSTANTS.IntelligenceCrimeBaseExpGain,
    },
  ),

  [CrimeTypes.mug]: new Crime(
    "to mug",
    "Attempt to mug a random person on the street",
    CrimeTypes.mug,
    4e3,
    36e3,
    1 / 5,
    0.25,
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

  [CrimeTypes.larceny]: new Crime(
    "larceny",
    "Attempt to rob property from someone's house",
    CrimeTypes.larceny,
    90e3,
    800e3,
    1 / 3,
    1.5,
    {
      hacking_exp: 45,
      dexterity_exp: 60,
      agility_exp: 60,

      hacking_success_weight: 0.5,
      dexterity_success_weight: 1,
      agility_success_weight: 1,

      intelligence_exp: 15 * CONSTANTS.IntelligenceCrimeBaseExpGain,
    },
  ),

  [CrimeTypes.dealDrugs]: new Crime(
    "to deal drugs",
    "Attempt to deal drugs",
    CrimeTypes.dealDrugs,
    10e3,
    120e3,
    1,
    0.5,
    {
      dexterity_exp: 5,
      agility_exp: 5,
      charisma_exp: 10,

      charisma_success_weight: 3,
      dexterity_success_weight: 2,
      agility_success_weight: 1,
    },
  ),

  [CrimeTypes.bondForgery]: new Crime(
    "to forge bonds",
    "Attempt to forge corporate bonds",
    CrimeTypes.bondForgery,
    300e3,
    4.5e6,
    1 / 2,
    0.1,
    {
      hacking_exp: 100,
      dexterity_exp: 150,
      charisma_exp: 15,

      hacking_success_weight: 0.05,
      dexterity_success_weight: 1.25,

      intelligence_exp: 60 * CONSTANTS.IntelligenceCrimeBaseExpGain,
    },
  ),

  [CrimeTypes.traffickArms]: new Crime(
    "to traffic arms",
    "Attempt to smuggle illegal arms into the city",
    CrimeTypes.traffickArms,
    40e3,
    600e3,
    2,
    1,
    {
      strength_exp: 20,
      defense_exp: 20,
      dexterity_exp: 20,
      agility_exp: 20,
      charisma_exp: 40,

      charisma_success_weight: 1,
      strength_success_weight: 1,
      defense_success_weight: 1,
      dexterity_success_weight: 1,
      agility_success_weight: 1,
    },
  ),

  [CrimeTypes.homicide]: new Crime(
    "homicide",
    "Attempt to murder a random person on the street",
    CrimeTypes.homicide,
    3e3,
    45e3,
    1,
    3,
    {
      strength_exp: 2,
      defense_exp: 2,
      dexterity_exp: 2,
      agility_exp: 2,

      strength_success_weight: 2,
      defense_success_weight: 2,
      dexterity_success_weight: 0.5,
      agility_success_weight: 0.5,

      kills: 1,
    },
  ),

  [CrimeTypes.grandTheftAuto]: new Crime(
    "grand theft auto",
    "Attempt to commit grand theft auto",
    CrimeTypes.grandTheftAuto,
    80e3,
    1.6e6,
    8,
    5,
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

      intelligence_exp: 16 * CONSTANTS.IntelligenceCrimeBaseExpGain,
    },
  ),

  [CrimeTypes.kidnap]: new Crime(
    "to kidnap",
    "Attempt to kidnap and ransom a high-profile-target",
    CrimeTypes.kidnap,
    120e3,
    3.6e6,
    5,
    6,
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

      intelligence_exp: 26 * CONSTANTS.IntelligenceCrimeBaseExpGain,
    },
  ),

  [CrimeTypes.assassination]: new Crime(
    "to assassinate",
    "Attempt to assassinate a high-profile target",
    CrimeTypes.assassination,
    300e3,
    12e6,
    8,
    10,
    {
      strength_exp: 300,
      defense_exp: 300,
      dexterity_exp: 300,
      agility_exp: 300,

      strength_success_weight: 1,
      dexterity_success_weight: 2,
      agility_success_weight: 1,

      intelligence_exp: 65 * CONSTANTS.IntelligenceCrimeBaseExpGain,

      kills: 1,
    },
  ),

  [CrimeTypes.heist]: new Crime(
    "a heist",
    "Attempt to pull off the ultimate heist",
    CrimeTypes.heist,
    600e3,
    120e6,
    18,
    15,
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

      intelligence_exp: 130 * CONSTANTS.IntelligenceCrimeBaseExpGain,
    },
  ),
};
