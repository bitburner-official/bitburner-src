import { Person } from "@nsdefs";

import { CONSTANTS } from "../../Constants";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { PlayerObject } from "../../PersonObjects/Player/PlayerObject";
import { Faction } from "../Faction";

export function repFromDonation(amt: number, person: Person): number {
  return (amt / CONSTANTS.DonateMoneyToRepDivisor) * person.mults.faction_rep * currentNodeMults.FactionWorkRepGain;
}

export function repNeededToDonate(): number {
  return Math.floor(CONSTANTS.BaseFavorToDonate * currentNodeMults.RepToDonateToFaction);
}

export function canDonate(amt: number, player: PlayerObject): boolean {
  return !isNaN(amt) && amt > 0 && player.money >= amt;
}

/** Donates money to the faction provided and returns repuation gained */
export function donate(amt: number, player: PlayerObject, faction: Faction) {
  if (!canDonate(amt, player)) {
    return 0;
  }

  const repGain = repFromDonation(amt, player);
  player.loseMoney(amt, "other");
  faction.playerReputation += repGain;

  return repGain;
}
