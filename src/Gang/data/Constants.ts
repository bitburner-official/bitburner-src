import { CONSTANTS } from "../../Constants";
import { FactionName } from "@enums";

export const GangConstants = {
  /** Number of members that can be recruited with 0 respect. */
  numFreeMembers: 3,
  /** Exponential base used in determining the respect threshold for recruiting a new member. */
  recruitThresholdBase: 5,
  // Respect is divided by this to get rep gain
  GangRespectToReputationRatio: 75,
  MaximumGangMembers: 12,
  CyclesPerTerritoryAndPowerUpdate: 100,
  // Portion of upgrade multiplier that is kept after ascending
  AscensionMultiplierRatio: 0.15,
  // Penalty to ascension points on install
  InstallAscensionPenalty: 0.95,
  // Names of possible Gangs
  Names: [
    FactionName.SlumSnakes,
    FactionName.Tetrads,
    FactionName.TheSyndicate,
    FactionName.TheDarkArmy,
    FactionName.SpeakersForTheDead,
    FactionName.NiteSec,
    FactionName.TheBlackHand,
  ] as string[],
  GangKarmaRequirement: -54000,
  /** Normal number of game cycles processed at once (2 seconds) */
  minCyclesToProcess: 2000 / CONSTANTS.MilliPerCycle,
  /** Maximum number of cycles to process at once during bonus time (5 seconds) */
  maxCyclesToProcess: 5000 / CONSTANTS.MilliPerCycle,
};
