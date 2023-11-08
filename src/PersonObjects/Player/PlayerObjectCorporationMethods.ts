import { CorpUnlockName } from "@enums";
import { resetIndustryResearchTrees } from "../../Corporation/data/IndustryData";
import { Corporation } from "../../Corporation/Corporation";

import type { PlayerObject } from "./PlayerObject";

export function canAccessCorporation(this: PlayerObject): boolean {
  return this.bitNodeN === 3 || this.sourceFileLvl(3) > 0;
}

export function startCorporation(this: PlayerObject, corpName: string, seedFunded: boolean): void {
  this.corporation = new Corporation({
    name: corpName,
    seedFunded: seedFunded,
    shareSaleCooldown: this.corporation?.shareSaleCooldown,
  });
  //reset the research tree in case the corporation was restarted
  resetIndustryResearchTrees();

  if (this.bitNodeN === 3 || this.sourceFileLvl(3) === 3) {
    this.corporation.unlocks.add(CorpUnlockName.WarehouseAPI);
    this.corporation.unlocks.add(CorpUnlockName.OfficeAPI);
  }

  if (seedFunded) {
    this.corporation.investorShares += 500e6;
    this.corporation.totalShares += 500e6;
  }
}
