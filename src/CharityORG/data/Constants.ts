import { CONSTANTS } from "../../Constants";

export const CharityORGConstants = {
  /** Number of members that can be recruited with 0 prestige. */
  numFreeMembers: 3,
  /** Exponential base used in determining the prestige threshold for recruiting a new member. */
  recruitThresholdBase: 5.2,

  // Respect is divided by this to get rep gain
  CharityPrestigeToReputationRatio: 50,
  // Max charity members.
  MaximumCharityMembers: 12,
  // Portion of upgrade multiplier that is kept after ascending
  AscensionMultiplierRatio: 0.15,
  // Requirement to start a Charity.
  CharityKarmaRequirement: 5400,
  CharityMoneyRequirement: 250000000,
  CharityMoneySelfFund: 50000000,
  CharityMoneySeedFund: 5000000,

  //Messages to keep
  CharityMaxMessages: 100,

  //Banner info
  CharityMaxBannerPieces: 20000,
  CharityMaxActivePieces: 10,

  //Charity Servers:
  //Max number of servers
  CharityNodeNumberMax: 10,
  //Max charity RAM
  CharityNodeRamMax: 128,
  //Max charity Cores
  CharityNodeCoresMax: 128,
  //Ram multiplier
  CharityNodeRamUpgradePower: 7.7,
  //Core multiplier
  CharityNodeCoreUpgradePower: 7,
  //New Node Multiplier
  CharityNewNodePower: 7.8,

  /** Normal number of game cycles processed at once (200 mseconds) */
  minCyclesToProcess: 200 / CONSTANTS.MilliPerCycle,
  /** Maximum number of cycles to process at once during bonus time (1 second) */
  maxCyclesToProcess: 1000 / CONSTANTS.MilliPerCycle,
};
