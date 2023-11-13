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
    desc: "Assign this volunteer to build a home<br><br>Earns visibility - Lowers terror slightnly - Spends money",
    name: "BuildHome",
    isSpending: true,
    params: {
      basePrestige: 0.00005,
      baseVisibility: 0.0001,
      baseTerror: -0.0001,
      baseMoneyGain: 0,
      baseMoneySpend: 1e4,
      baseKarmaGain: 0.001,
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 25,
      difficulty: 1,
    },
  },
  {
    desc: "Assign this volunteer to fundraise<br><br>Earns visibility - Raises money",
    name: "Fundraise",
    isSpending: true,
    params: {
      basePrestige: 0.00005,
      baseVisibility: 0.0002,
      baseMoneyGain: 1e6,
      baseKarmaGain: 0.0005,
      strWeight: 10,
      defWeight: 10,
      dexWeight: 10,
      agiWeight: 10,
      chaWeight: 60,
      difficulty: 5,
    },
  },
];
