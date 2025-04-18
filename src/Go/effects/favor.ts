import { GoOpponent } from "@enums";
import { Go } from "../Go";
import { newOpponentStats } from "../Constants";

export function getGoFavorForFaction(factionName: string) {
  const factionDetails = getOpponentStats(factionName as unknown as GoOpponent);
  return factionDetails?.favor ?? 0;
}

export function getOpponentStats(opponent: GoOpponent) {
  return Go.stats[opponent] ?? (Go.stats[opponent] = newOpponentStats());
}
