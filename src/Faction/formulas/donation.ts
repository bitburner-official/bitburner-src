import { CONSTANTS } from "../../Constants";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Person as IPerson } from "@nsdefs";

export function repFromDonation(amt: number, person: IPerson): number {
  return (amt / CONSTANTS.DonateMoneyToRepDivisor) * person.mults.faction_rep * currentNodeMults.FactionWorkRepGain;
}
