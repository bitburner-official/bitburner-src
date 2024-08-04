import type { PlayerObject } from "../PersonObjects/Player/PlayerObject";

import { FactionName, FactionDiscovery } from "@enums";
import { Faction } from "./Faction";

import { Reviver } from "../utils/JSONReviver";
import { assertLoadingType } from "../utils/TypeAssertion";
import { PartialRecord, createEnumKeyedRecord, getRecordValues } from "../Types/Record";
import { Augmentations } from "../Augmentation/Augmentations";
import { getEnumHelper } from "../utils/EnumHelper";
import { clampNumber } from "../utils/helpers/clampNumber";

/** The static list of all factions. Initialized once and never modified. */
export const Factions = createEnumKeyedRecord(FactionName, (name) => new Faction(name));
// Add the associated augs to every faction
for (const aug of getRecordValues(Augmentations)) {
  for (const factionName of aug.factions) {
    const faction = Factions[factionName];
    faction.augmentations.push(aug.name);
  }
}

type SavegameFaction = { playerReputation?: number; favor?: number; discovery?: FactionDiscovery };

export function loadFactions(saveString: string, player: PlayerObject): void {
  const loadedFactions = JSON.parse(saveString, Reviver) as unknown;
  // This loading method allows invalid data in player save, but just ignores anything invalid
  if (!loadedFactions) return;
  if (typeof loadedFactions !== "object") return;
  for (const [loadedFactionName, loadedFaction] of Object.entries(loadedFactions) as [string, unknown][]) {
    if (!getEnumHelper("FactionName").isMember(loadedFactionName)) continue;
    if (!loadedFaction) continue;
    const faction = Factions[loadedFactionName];
    if (typeof loadedFaction !== "object") continue;
    assertLoadingType<SavegameFaction>(loadedFaction);
    const { playerReputation: loadedRep, favor: loadedFavor, discovery: loadedDiscovery } = loadedFaction;
    if (typeof loadedRep === "number" && loadedRep >= 0) {
      // `playerReputation` must be in [0, Number.MAX_VALUE].
      faction.playerReputation = clampNumber(loadedRep, 0);
    }
    if (typeof loadedFavor === "number" && loadedFavor >= 0) {
      // `favor` must be in [0, MaxFavor]. This rule will be enforced in the `setFavor` function.
      faction.setFavor(loadedFavor);
    }
    if (getEnumHelper("FactionDiscovery").isMember(loadedDiscovery)) faction.discovery = loadedDiscovery;
  }
  // Load joined factions from player save
  for (const joinedFacName of player.factions) {
    if (!getEnumHelper("FactionName").isMember(joinedFacName)) {
      console.error(`Invalid faction in player save factions array: ${joinedFacName}`);
      continue;
    }
    const faction = Factions[joinedFacName];
    faction.isMember = true;
    faction.alreadyInvited = true;
    faction.discovery = FactionDiscovery.known;
    for (const enemyFacName of faction.getInfo().enemies) Factions[enemyFacName].isBanned = true;
  }
  // Load invited factions from player save
  for (const invitedFaction of player.factionInvitations) {
    if (!getEnumHelper("FactionName").isMember(invitedFaction)) {
      console.error(`Invalid faction in player save factionInvitations array: ${invitedFaction}`);
      continue;
    }
    Factions[invitedFaction].alreadyInvited = true;
    Factions[invitedFaction].discovery = FactionDiscovery.known;
  }
}

export function getFactionsSave(): PartialRecord<FactionName, SavegameFaction> {
  const save: PartialRecord<FactionName, SavegameFaction> = {};
  for (const factionName of getEnumHelper("FactionName").valueArray) {
    const faction = Factions[factionName];
    const discovery = faction.discovery === FactionDiscovery.unknown ? undefined : faction.discovery;
    const { favor, playerReputation } = faction;
    if (discovery || favor || playerReputation) {
      save[factionName] = { favor: favor || undefined, playerReputation: playerReputation || undefined, discovery };
    }
  }
  return save;
}
