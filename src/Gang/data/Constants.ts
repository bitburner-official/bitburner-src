import { FactionName } from "../../Faction/data/Enums";

export const GangConstants = {
  // Respect is divided by this to get rep gain
  GangRespectToReputationRatio: 75,
  MaximumGangMembers: 12,
  CyclesPerTerritoryAndPowerUpdate: 100,
  // Portion of upgrade multiplier that is kept after ascending
  AscensionMultiplierRatio: 0.15,
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
};
