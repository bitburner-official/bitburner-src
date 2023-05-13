import { CorpUnlockName } from "../../Corporation/data/Enums";
import { Corporation } from "../../Corporation/Corporation";
import { resetIndustryResearchTrees } from "../../Corporation/IndustryData";

import type { PlayerObject } from "./PlayerObject";

export function canAccessCorporation(this: PlayerObject): boolean {
  return this.bitNodeN === 3 || this.sourceFileLvl(3) > 0;
}

export function startCorporation(this: PlayerObject, corpName: string, seedFunded: boolean): void {
  this.corporation = new Corporation({
    name: corpName,
    seedFunded: seedFunded,
  });
  //reset the research tree in case the corporation was restarted
  resetIndustryResearchTrees();

  if (this.bitNodeN === 3 || this.sourceFileLvl(3) === 3) {
    this.corporation.unlocks.add(CorpUnlockName.WarehouseAPI);
    this.corporation.unlocks.add(CorpUnlockName.OfficeAPI);
  }

  this.corporation.totalShares += seedFunded ? 500_000_000 : 0;
}
