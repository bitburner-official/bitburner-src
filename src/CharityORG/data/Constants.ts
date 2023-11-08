import { CONSTANTS } from "../../Constants";


export const CharityConstants = {
  /** Number of members that can be recruited with 0 respect. */
  numFreeMembers: 3,
  /** Exponential base used in determining the respect threshold for recruiting a new member. */
  recruitThresholdBase: 4.2,

  // Respect is divided by this to get rep gain
  CharityPrestigeToReputationRatio: 75,
  MaximumCharityMembers: 12,

  // Portion of upgrade multiplier that is kept after ascending
  AscensionMultiplierRatio: 0.15,
  
  CharityKarmaRequirement: 5400,
  /** Normal number of game cycles processed at once (2 seconds) */
  minCyclesToProcess: 2000 / CONSTANTS.MilliPerCycle,
  /** Maximum number of cycles to process at once during bonus time (5 seconds) */
  maxCyclesToProcess: 5000 / CONSTANTS.MilliPerCycle,
};
