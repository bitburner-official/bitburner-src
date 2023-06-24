/**
 * Initialization and manipulation of the Factions object, which stores data
 * about all Factions in the game
 */
import { FactionName } from "@enums";
import { Faction } from "./Faction";

import { Reviver, assertLoadingType } from "../utils/JSONReviver";
import { createEnumKeyedRecord, getRecordValues } from "../Types/Record";
import { Augmentations } from "../Augmentation/Augmentations";
import { getEnumHelper } from "../utils/EnumHelper";

/** The static list of all factions. Initialized once and never modified. */
export const Factions = createEnumKeyedRecord(FactionName, (name) => new Faction(name));
// Add the associated augs to every faction
for (const aug of getRecordValues(Augmentations)) {
  for (const factionName of aug.factions) {
    const faction = Factions[factionName];
    faction.augmentations.push(aug.name);
  }
}

export function loadFactions(saveString: string): void {
  // The only information that should be loaded from player save is
  const loadedFactions = JSON.parse(saveString, Reviver) as unknown;
  // This loading method allows invalid data in player save, but just ignores anything invalid
  if (!loadedFactions) return;
  if (typeof loadedFactions !== "object") return;
  for (const [loadedFactionName, loadedFaction] of Object.entries(loadedFactions) as [string, unknown][]) {
    if (!getEnumHelper("FactionName").isMember(loadedFactionName)) continue;
    if (!loadedFaction) continue;
    const faction = Factions[loadedFactionName];
    if (typeof loadedFaction !== "object") continue;
    assertLoadingType<Faction>(loadedFaction);
    if (typeof loadedFaction.playerReputation === "number" && loadedFaction.playerReputation > 0) {
      faction.playerReputation = loadedFaction.playerReputation;
    }
    if (typeof loadedFaction.favor === "number" && loadedFaction.favor > 0) faction.favor = loadedFaction.favor;
    if (loadedFaction.alreadyInvited) faction.alreadyInvited = true;
    if (loadedFaction.isBanned) faction.isBanned = true;
    if (loadedFaction.isMember) faction.isMember = true;
  }
}
