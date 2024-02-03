import { ITaskParams } from "../ITaskParams";

/**
 * Defines the parameters that can be used to initialize and describe a GangMemberTask
 * (defined in Gang.js)
 */
interface ICharityVolunteerTaskMetadata {
  /** Description of the task */
  desc: string;

  /** Name of the task */
  name: string;

  // Display name of task
  short_name: string;

  /** If the task spends money*/
  isSpending: boolean;

  /**
   * An object containing weighting parameters for the task. These parameters are used for
   * various calculations (Prestige gain, etc.)
   */
  params: ITaskParams;
}

/**
 * Array of metadata for all Gang Member tasks. Used to construct the global GangMemberTask
 * objects in Gang.js
 */
export const charityVolunteerTasksMetadata: ICharityVolunteerTaskMetadata[] = [
  {
    desc: "This volunteer is currently idle",
    name: "Unassigned",
    short_name: "Unassigned",
    isSpending: false,
    params: { hackWeight: 100 }, // This is just to get by the weight check in the CharityVolunteerTask constructor
  },
  {
    desc: "Assign this charity volunteer to increase their primary stats (str, def, dex, agi)",
    name: "Train Primary",
    short_name: "Train Primary",
    isSpending: false,
    params: {
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 25,
      difficulty: 1000,
    },
  },
  {
    desc: "Assign this volunteer to train their hacking and charisma",
    name: "Train Mind",
    short_name: "Train Mind",
    isSpending: false,
    params: { hackWeight: 50, chaWeight: 50, difficulty: 1000 },
  },
  {
    desc: "Assign this volunteer to beg for money on the street<br><br>Earns prestige, raises money",
    name: "Beg",
    short_name: "Beg",
    isSpending: false,
    params: {
      basePrestige: 1.125,
      //baseVisibility: 0.00000021112,
      baseMoneyGain: 8000000,
      //baseKarmaGain: 0.0005,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 1,
    },
  },
  {
    desc: "Assign this volunteer to spead the word of the charity, though all means at their disposal.<br><br>Raises visibility, earnes prestige and karma - Spends money",
    name: "Spead the Word",
    short_name: "Spead the Word",
    isSpending: true,
    params: {
      baseMoneySpend: 4000000,
      basePrestige: 17,
      baseVisibility: 0.000010556,
      baseKarmaGain: 0.0000000375,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 1,
    },
  },
  {
    desc: "Their mission, to earn you Karma.<br><br>Raises visibility, earnes prestige and karma - Spends money",
    name: "Basic Charity Work",
    short_name: "Basic Charity Work",
    isSpending: true,
    params: {
      baseMoneySpend: 4000000,
      baseVisibility: 0.000010556,
      basePrestige: 1.125,
      baseKarmaGain: 0.00000375,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 1,
    },
  },
  {
    desc: "Assign this volunteer to fundraise<br><br>Earns prestige - raises money",
    name: "Fundraise",
    short_name: "Fundraise",
    isSpending: false,
    params: {
      basePrestige: 5.625,
      //baseVisibility: 0.000001,
      baseMoneyGain: 425000000,
      //baseKarmaGain: 0.0005,
      hackWeight: 30,
      strWeight: 10,
      defWeight: 10,
      dexWeight: 10,
      agiWeight: 10,
      chaWeight: 30,
      difficulty: 50,
    },
  },
  {
    desc: "Assign this volunteer to go door to door, raising donations<br><br>Earns prestige - raises money",
    name: "Door to Door",
    short_name: "Door to Door",
    isSpending: false,
    params: {
      basePrestige: 22.5,
      //baseVisibility: 0.00004,
      baseMoneyGain: 1800000000,
      //baseKarmaGain: 0.00053,
      hackWeight: 30,
      strWeight: 10,
      defWeight: 10,
      dexWeight: 10,
      agiWeight: 10,
      chaWeight: 30,
      difficulty: 200,
    },
  },
  {
    desc: "Volunteer will organize and run a world telethon<br><br>Earns prestige - raises money",
    name: "Organize Telethon",
    short_name: "Organize Telethon",
    isSpending: false,
    params: {
      basePrestige: 45,
      //baseVisibility: 0.00008,
      baseMoneyGain: 4000000000,
      //baseKarmaGain: 0.00053,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 400,
    },
  },
];
