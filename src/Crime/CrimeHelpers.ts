import { Crimes } from "./Crimes";
import { Crime } from "./Crime";
import { Player } from "@player";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { CrimeTypes } from "../Enums";

//This is only used for the player
export function determineCrimeSuccess(type: string): boolean {
  if (!CrimeTypes.has(type)) {
    dialogBoxCreate(`ERR: Unrecognized crime type: ${type} This is probably a bug please contact the developer`);
    return false;
  }
  const crime = Crimes[type];
  const chance = crime.successRate(Player);
  return Math.random() <= chance;
}

export function findCrime(roughName: string): Crime | null {
  if (CrimeTypes.has(roughName)) return Crimes[roughName];
  roughName = roughName.toLowerCase();
  if (roughName.includes("shoplift")) return Crimes[CrimeTypes.shoplift];
  else if (roughName.includes("rob") && roughName.includes("store")) return Crimes[CrimeTypes.robStore];
  else if (roughName.includes("mug")) return Crimes[CrimeTypes.mug];
  else if (roughName.includes("larceny")) return Crimes[CrimeTypes.larceny];
  else if (roughName.includes("drugs")) return Crimes[CrimeTypes.dealDrugs];
  else if (roughName.includes("bond") && roughName.includes("forge")) return Crimes[CrimeTypes.bondForgery];
  else if ((roughName.includes("traffic") || roughName.includes("illegal")) && roughName.includes("arms")) {
    return Crimes[CrimeTypes.traffickArms];
  } else if (roughName.includes("homicide")) return Crimes[CrimeTypes.homicide];
  else if (roughName.includes("grand") && roughName.includes("auto")) return Crimes[CrimeTypes.grandTheftAuto];
  else if (roughName.includes("kidnap")) return Crimes[CrimeTypes.kidnap];
  else if (roughName.includes("assassin")) return Crimes[CrimeTypes.assassination];
  else if (roughName.includes("heist")) return Crimes[CrimeTypes.heist];
  return null;
}
