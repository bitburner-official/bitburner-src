/**
 * Initialization and manipulation of the Factions object, which stores data
 * about all Factions in the game
 */
import { Faction } from "./Faction";
import { FactionInfos } from "./FactionInfo";

import { Reviver } from "../utils/JSONReviver";
import { getRecordValues } from "../Types/Record";
import { Augmentations, initCircadianModulator } from "../Augmentation/Augmentations";

export let Factions: Record<string, Faction> = {};

export function loadFactions(saveString: string): void {
  Factions = JSON.parse(saveString, Reviver);
  // safety check for when we load older save file that don't have newer factions
  for (const faction of Object.keys(Factions)) {
    try {
      Factions[faction].getInfo();
    } catch (err) {
      console.error("deleting " + faction);
      delete Factions[faction];
    }
  }
}

function AddToFactions(faction: Faction): void {
  const name: string = faction.name;
  Factions[name] = faction;
}

export function factionExists(name: string): boolean {
  return Object.hasOwn(Factions, name);
}

export function initFactions(): void {
  for (const name of Object.keys(FactionInfos)) {
    resetFaction(new Faction(name));
  }
}

//Resets a faction during (re-)initialization. Saves the favor in the new
//Faction object and deletes the old Faction Object from "Factions". Then
//reinserts the new Faction object
function resetFaction(newFactionObject: Faction): void {
  const factionName: string = newFactionObject.name;
  if (factionExists(factionName)) {
    newFactionObject.favor = Factions[factionName].favor;
    delete Factions[factionName];
  }
  AddToFactions(newFactionObject);
  // All factions are added, this is a good place to add augs back to factions.
  initCircadianModulator();
  for (const aug of getRecordValues(Augmentations)) {
    for (const factionName of aug.factions) {
      const faction = Factions[factionName];
      if (!faction) {
        console.error(`Faction ${factionName} did not exist while adding augs to factions`);
        continue;
      }
      faction.augmentations.add(aug.name);
    }
  }
}
