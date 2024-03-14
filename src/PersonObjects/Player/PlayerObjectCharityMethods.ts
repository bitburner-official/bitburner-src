import { CharityORG } from "../../CharityORG/CharityORG";
import { CharityORGConstants } from "../../CharityORG/data/Constants";
import type { PlayerObject } from "./PlayerObject";

export function canAccessCharity(this: PlayerObject): boolean {
  return (
    this.bitNodeN === 15 || (this.sourceFileLvl(15) > 0 && this.karma >= CharityORGConstants.CharityKarmaRequirement)
  );
}

export function startCharity(this: PlayerObject, charityName: string, seedFunded: boolean): void {
  this.charityORG = new CharityORG(charityName, seedFunded);
  if (seedFunded) {
    this.charityORG.bank = CharityORGConstants.CharityMoneySeedFund;
    this.charityORG.addMessage("Took over a failing Charity: " + charityName);
  } else {
    this.charityORG.bank = CharityORGConstants.CharityMoneySelfFund;
    this.charityORG.addMessage("Started a new Charity: " + charityName);
  }
}
