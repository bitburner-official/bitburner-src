import { Person as IPerson } from "@nsdefs";
import { Player } from "@player";

import { CONSTANTS } from "../../Constants";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Faction } from "../Faction";

export function repFromDonation(amt: number, person: IPerson): number {
  return (amt / CONSTANTS.DonateMoneyToRepDivisor) * person.mults.faction_rep * currentNodeMults.FactionWorkRepGain;
}

export function donationForRep(rep: number, person: IPerson): number {
  return (rep * CONSTANTS.DonateMoneyToRepDivisor) / person.mults.faction_rep / currentNodeMults.FactionWorkRepGain;
}

export function repNeededToDonate(): number {
  return Math.floor(CONSTANTS.BaseFavorToDonate * currentNodeMults.RepToDonateToFaction);
}

export function canDonate(amt: number): boolean {
  return !isNaN(amt) && amt > 0 && Player.money >= amt;
}

/** Donates money to the faction provided and returns repuation gained */
export function donate(amt: number, faction: Faction) {
  if (!canDonate(amt)) {
    return 0;
  }

  const repGain = repFromDonation(amt, Player);
  Player.loseMoney(amt, "other");
  faction.playerReputation += repGain;

  return repGain;
}
