import { Crimes } from "./Crimes";
import { Player } from "@player";

import { CrimeType } from "@enums";

//This is only used for the player
export function determineCrimeSuccess(type: CrimeType): boolean {
  const crime = Crimes[type];
  const chance = crime.successRate(Player);
  return Math.random() <= chance;
}
