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
    isSpending: false,
    params: { hackWeight: 100 }, // This is just to get by the weight check in the CharityVolunteerTask constructor
  },
  {
    desc: "Assign this charity volunteer to increase their primary stats (str, def, dex, agi)",
    name: "Train Primary",
    isSpending: false,
    params: {
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 25,
      difficulty: 100,
    },
  },
  {
    desc: "Assign this volunteer to train their hacking and charisma",
    name: "Train Mind",
    isSpending: false,
    params: { hackWeight: 50, chaWeight: 50, difficulty: 100 },
  },
  {
    desc: "Assign this volunteer to spead the word of the charity, though all means at their disposal.<br><br>Earns visibility and prestige - Spends money",
    name: "Spead the Word",
    isSpending: true,
    params: {
      baseMoneySpend: 25,
      basePrestige: 0.00225,
      baseVisibility: 0.000005,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 10,
    },
  },
  {
    desc: "Their mission, to earn you Karma.<br><br>Earns karma, visibility",
    name: "Basic Charity Work",
    isSpending: true,
    params: {
      baseMoneySpend: 25,
      baseVisibility: 0.000005,
      baseKarmaGain: 0.00075,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 10,
    },
  },
  {
    desc: "Assign this volunteer to build a home<br><br>Earns visibility - Lowers terror slightnly - Spends money",
    name: "Build Home",
    isSpending: true,
    params: {
      basePrestige: 0.0005,
      baseVisibility: 0.00001,
      baseTerror: 0.00001,
      baseMoneySpend: 1e3,
      baseKarmaGain: 0.0005,
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 25,
      difficulty: 10,
    },
  },
  {
    desc: "Assign this volunteer to fundraise<br><br>Earns prestige, visibility - Raises money",
    name: "Fundraise",
    isSpending: false,
    params: {
      basePrestige: 0.0005,
      baseVisibility: 0.00001,
      baseMoneyGain: 2e3,
      //baseKarmaGain: 0.0005,
      hackWeight: 30,
      strWeight: 10,
      defWeight: 10,
      dexWeight: 10,
      agiWeight: 10,
      chaWeight: 30,
      difficulty: 10,
    },
  },
  {
    desc: "Assign this volunteer to fight terror<br><br>Earns prestige, visibility, lowers terror - Spends money",
    name: "Fight Terror",
    isSpending: true,
    params: {
      basePrestige: 0.0005,
      baseTerror: 0.00007,
      baseVisibility: 0.00002,
      baseMoneySpend: 1e3,
      baseKarmaGain: 0.00051,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 20,
    },
  },
  {
    desc: "Assign this volunteer to raise the visibility of the charity<br><br>Earns prestige, visibility - Spends money",
    name: "Raise Visibility",
    isSpending: true,
    params: {
      basePrestige: 0.00005,
      baseVisibility: 0.0001,
      baseMoneySpend: 1e3,
      baseKarmaGain: 0.00051,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 20,
    },
  },
  {
    desc: "Assign this volunteer to go door to door, raising donations<br><br>Earns prestige, visibility - Raises money",
    name: "Door to Door",
    isSpending: false,
    params: {
      basePrestige: 0.0005,
      baseVisibility: 0.000002,
      baseMoneyGain: 2e4,
      //baseKarmaGain: 0.00052,
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
    desc: "Assign this volunteer to hold a press conference<br><br>Earns prestige, visibility - Spends money",
    name: "Press Conference",
    isSpending: true,
    params: {
      basePrestige: 0.0005,
      baseTerror: 0.00005,
      baseMoneySpend: 1e4,
      baseVisibility: 0.00015,
      baseKarmaGain: 0.00052,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 50,
    },
  },
  {
    desc: "Assigns this volunteer to a community watch beat<br><br>Earns prestige, visibility, lowers terror - Spends money",
    name: "Community Watch",
    isSpending: true,
    params: {
      basePrestige: 0.0005,
      baseTerror: 0.00015,
      baseVisibility: 0.00015,
      baseMoneySpend: 1e4,
      baseKarmaGain: 0.00052,
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 25,
      difficulty: 50,
    },
  },
  {
    desc: "This volunteer will address the world on various issues<br><br>Earns prestige, visibility, lowers terror - Spends money",
    name: "World Presence",
    isSpending: true,
    params: {
      basePrestige: 0.0004,
      baseTerror: 0.00016,
      baseMoneySpend: 1e7,
      baseVisibility: 0.00016,
      baseKarmaGain: 0.00053,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 80,
    },
  },
  {
    desc: "Volunteer will devote their time to Organizing a Militia<br><br>Earns prestige, lowers terror - Spends money",
    name: "Organize Militia",
    isSpending: true,
    params: {
      basePrestige: 0.0003,
      baseTerror: 0.00017,
      baseVisibility: 0.0001,
      baseMoneySpend: 1e7,
      baseKarmaGain: 0.00053,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 80,
    },
  },
  {
    desc: "Volunteer will organize and run a world telethon<br><br>Earns prestige, visibility - Raises money",
    name: "Organize Telethon",
    isSpending: false,
    params: {
      basePrestige: 0.0002,
      baseVisibility: 0.0001,
      baseMoneyGain: 2e7,
      //baseKarmaGain: 0.00053,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 80,
    },
  },
  {
    desc: "Volunteer will distribute equipment to the polulace and organize efforts against terrorism<br><br>Earns prestige, visibility - Raises money",
    name: "Co-ordinate Populace",
    isSpending: true,
    params: {
      basePrestige: 0.0003,
      baseVisibility: 0.00019,
      baseTerror: 0.00019,
      baseMoneySpend: 3e7,
      baseKarmaGain: 0.00054,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      dexWeight: 15,
      agiWeight: 15,
      chaWeight: 20,
      difficulty: 90,
    },
  },
];
