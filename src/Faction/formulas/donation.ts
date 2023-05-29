import { Person as IPerson } from "@nsdefs";

import { BitNodeMultipliers } from "../../BitNode/BitNodeMultipliers";
import { CONSTANTS } from "../../Constants";

export function repFromDonation(amt: number, person: IPerson): number {
  return (amt / CONSTANTS.DonateMoneyToRepDivisor) * person.mults.faction_rep * BitNodeMultipliers.FactionWorkRepGain;
}
