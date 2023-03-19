import { FactionName } from "../../Faction/data/Enums";
export const PowerMultiplier: {
  [key: string]: number | undefined;
} = {
  [FactionName.SlumSnakes]: 1,
  [FactionName.Tetrads]: 2,
  [FactionName.TheSyndicate]: 2,
  [FactionName.TheDarkArmy]: 2,
  [FactionName.SpeakersForTheDead]: 5,
  [FactionName.NiteSec]: 2,
  [FactionName.TheBlackHand]: 5,
};
