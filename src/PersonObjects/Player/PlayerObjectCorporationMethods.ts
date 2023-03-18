import { Corporation } from "../../Corporation/Corporation";
import {
  CorporationUnlockUpgradeIndex,
  CorporationUnlockUpgrades,
} from "../../Corporation/data/CorporationUnlockUpgrades";
import { PlayerObject } from "./PlayerObject";
import { resetIndustryResearchTrees } from "../../Corporation/IndustryData";

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
    const warehouseApi = CorporationUnlockUpgrades[CorporationUnlockUpgradeIndex.WarehouseAPI].index;
    const OfficeApi = CorporationUnlockUpgrades[CorporationUnlockUpgradeIndex.OfficeAPI].index;

    this.corporation.unlockUpgrades[warehouseApi] = 1;
    this.corporation.unlockUpgrades[OfficeApi] = 1;
  }

  this.corporation.totalShares += seedFunded ? 500_000_000 : 0;
}
