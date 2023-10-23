import { Crimes } from "./Crimes";
import { Crime } from "./Crime";
import { Player } from "@player";

import { getEnumHelper } from "../utils/EnumHelper";
import { CrimeType } from "@enums";

//This is only used for the player
export function determineCrimeSuccess(type: CrimeType): boolean {
  const crime = Crimes[type];
  const chance = crime.successRate(Player);
  return Math.random() <= chance;
}

export function findCrime(roughName: string): Crime | null {
  const matchedName = getEnumHelper("CrimeType").getMember(roughName, { fuzzy: true });
  if (matchedName) return Crimes[matchedName];
  // This can probably all be removed
  roughName = roughName.toLowerCase();
  if (roughName.includes("shoplift")) return Crimes[CrimeType.shoplift];
  else if (roughName.includes("rob") && roughName.includes("store")) return Crimes[CrimeType.robStore];
  else if (roughName.includes("mug")) return Crimes[CrimeType.mug];
  else if (roughName.includes("larceny")) return Crimes[CrimeType.larceny];
  else if (roughName.includes("drugs")) return Crimes[CrimeType.dealDrugs];
  else if (roughName.includes("bond") && roughName.includes("forge")) return Crimes[CrimeType.bondForgery];
  else if ((roughName.includes("traffic") || roughName.includes("illegal")) && roughName.includes("arms")) {
    return Crimes[CrimeType.traffickArms];
  } else if (roughName.includes("homicide")) return Crimes[CrimeType.homicide];
  else if (roughName.includes("grand") && roughName.includes("auto")) return Crimes[CrimeType.grandTheftAuto];
  else if (roughName.includes("kidnap")) return Crimes[CrimeType.kidnap];
  else if (roughName.includes("assassin")) return Crimes[CrimeType.assassination];
  else if (roughName.includes("heist")) return Crimes[CrimeType.heist];
  //
  return null;
}
