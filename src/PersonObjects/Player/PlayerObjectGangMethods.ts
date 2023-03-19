import { Factions } from "../../Faction/Factions";
import { Faction } from "../../Faction/Faction";
import { Gang } from "../../Gang/Gang";
import { GangConstants } from "../../Gang/data/Constants";
import { isFactionWork } from "../../Work/FactionWork";
import { FactionName } from "../../Faction/data/Enums";
import { getEnumHelper } from "../../utils/helpers/enum";
import { gangFactions } from "../../Gang/data/Enums";

import type { PlayerObject } from "./PlayerObject";

export function canAccessGang(this: PlayerObject): boolean {
  return this.bitNodeN === 2 || (this.sourceFileLvl(2) > 0 && this.karma <= GangConstants.GangKarmaRequirement);
}

export function isAwareOfGang(this: PlayerObject): boolean {
  return this.bitNodeN === 2 || this.sourceFileLvl(2) >= 1;
}

export function getGangFaction(this: PlayerObject): Faction {
  const gang = this.gang;
  if (gang === null) throw new Error("Cannot get gang faction because player is not in a gang.");

  const fac = Factions[gang.facName];
  if (fac == null) throw new Error(`Gang has invalid faction name: ${gang.facName}`);

  return fac;
}

export function getGangName(this: PlayerObject): string {
  const gang = this.gang;
  return gang ? gang.facName : "";
}

export function hasGangWith(this: PlayerObject, facName: string): boolean {
  const gang = this.gang;
  return gang ? gang.facName === facName : false;
}

export function startGang(this: PlayerObject, factionName: FactionName, isHacking: boolean): void {
  const faction = Factions[factionName];
  if (!getEnumHelper(gangFactions).isMember(factionName)) {
    throw new Error(`Invalid faction when creating gang: ${factionName}`);
  }
  // isFactionWork handles null internally, finishWork might need to be run with true
  if (isFactionWork(this.currentWork) && this.currentWork.factionName === factionName) this.finishWork(false);

  this.gang = new Gang(factionName, isHacking);

  faction.playerReputation = 0;
}

export function inGang(this: PlayerObject) {
  return Boolean(this.gang);
}
