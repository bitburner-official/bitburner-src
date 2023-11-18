import { CONSTANTS } from "../../Constants";

export const CharityORGConstants = {
  /** Number of members that can be recruited with 0 prestige. */
  numFreeMembers: 3,
  /** Exponential base used in determining the prestige threshold for recruiting a new member. */
  recruitThresholdBase: 4.2,

  // Respect is divided by this to get rep gain
  CharityPrestigeToReputationRatio: 45,
  MaximumCharityMembers: 12,

  // Portion of upgrade multiplier that is kept after ascending
  AscensionMultiplierRatio: 0.15,

  CharityKarmaRequirement: 5400,
  /** Normal number of game cycles processed at once (2 seconds) */
  minCyclesToProcess: 200 / CONSTANTS.MilliPerCycle,
  /** Maximum number of cycles to process at once during bonus time (5 seconds) */
  maxCyclesToProcess: 600 / CONSTANTS.MilliPerCycle,
};
