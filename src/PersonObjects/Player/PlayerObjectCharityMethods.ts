import { CharityORG } from "../../CharityORG/CharityORG";

import type { PlayerObject } from "./PlayerObject";

export function canAccessCharity(this: PlayerObject): boolean {
  return this.bitNodeN === 15 || this.sourceFileLvl(15) > 0;
}

export function startCharity(this: PlayerObject, charityName: string, seedFunded: boolean): void {
  this.charityORG = new CharityORG(charityName, seedFunded);

  if (seedFunded) {
    this.charityORG.bank = 5e6;
  } else {
    this.charityORG.bank = 50e6;
  }
}
