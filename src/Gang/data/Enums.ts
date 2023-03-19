import { FactionName } from "../../Faction/data/Enums";
export type GangFaction =
  | FactionName.SlumSnakes
  | FactionName.Tetrads
  | FactionName.TheSyndicate
  | FactionName.TheDarkArmy
  | FactionName.SpeakersForTheDead
  | FactionName.NiteSec
  | FactionName.TheBlackHand;
export const gangFactions: GangFaction[] = [
  FactionName.SlumSnakes,
  FactionName.Tetrads,
  FactionName.TheSyndicate,
  FactionName.TheDarkArmy,
  FactionName.SpeakersForTheDead,
  FactionName.NiteSec,
  FactionName.TheBlackHand,
];
