import { Charities } from "./Charities";
import { Charity } from "./Charity";
import { Player } from "@player";

import { getEnumHelper } from "../utils/EnumHelper";
import { CharityType } from "@enums";

//This is only used for the player
export function determineCharitySuccess(type: CharityType): boolean {
  const charity = Charities[type];
  const chance = charity.successRate(Player);
  return Math.random() <= chance;
}

export function findCharity(roughName: string): Charity | null {
  const matchedName = getEnumHelper("CharityType").getMember(roughName, { fuzzy: true });
  if (matchedName) return Charities[matchedName];
  // This can probably all be removed
  roughName = roughName.toLowerCase();
  if (roughName.includes("stop") && roughName.includes("robery")) return Charities[CharityType.stopRobery];
  else if (roughName.includes("hug") && roughName.includes("someone")) return Charities[CharityType.hugSomeoneInNeed];
  else if (roughName.includes("help") && roughName.includes("police")) return Charities[CharityType.helpPolice];
  else if (roughName.includes("work") && roughName.includes("soup")) return Charities[CharityType.workAtSoupKitchen];
  else if (roughName.includes("report") && roughName.includes("drug")) return Charities[CharityType.reportDrugDeal];
  else if (roughName.includes("pay") && roughName.includes("forward")) return Charities[CharityType.payItForward];
  else if (roughName.includes("patrol") && roughName.includes("streets")) return Charities[CharityType.patroleTheStreets];
  else if (roughName.includes("give") && roughName.includes("back")) return Charities[CharityType.giveBack];
  else if (roughName.includes("take") && roughName.includes("knife")) return Charities[CharityType.takeKnife];
  else if (roughName.includes("hold") && roughName.includes("fund") && roughName.includes("raiser")) return Charities[CharityType.holdFundRaiser];
  //
  return null;
}
