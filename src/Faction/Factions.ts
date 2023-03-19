/**
 * Initialization and manipulation of the Factions object, which stores data
 * about all Factions in the game
 */
import { Faction } from "./Faction";

import { Reviver } from "../utils/JSONReviver";
import { FactionName } from "./data/Enums";
import { getEnumHelper } from "../utils/helpers/enum";

export let Factions = {} as Record<FactionName, Faction>;

export function loadFactions(saveString: string): void {
  Factions = JSON.parse(saveString, Reviver);
  // safety check for when we load older save file that don't have newer factions
  Object.keys(Factions).forEach((factionName) => {
    if (!getEnumHelper(FactionName).isMember(factionName)) {
      //@ts-ignore ts knows this is not a correct key for Factions, which is the same reason we're deleting it
      delete Factions[factionName];
      return;
    }
    try {
      Factions[factionName].getInfo();
    } catch {
      console.error(`Deleting ${factionName} from Factions object`);
      delete Factions[factionName];
    }
  });

  // Ensure that all factions exist prior to the rest of the load sequence.
  for (const factionName of Object.values(FactionName)) {
    if (!Factions[factionName]) Factions[factionName] = new Faction(factionName);
  }
}

export function initFactions(): void {
  for (const name of Object.values(FactionName)) {
    resetFaction(new Faction(name));
  }
}

//Resets a faction during (re-)initialization. Saves the favor in the new
//Faction object and deletes the old Faction Object from "Factions". Then
//reinserts the new Faction object
function resetFaction(newFactionObject: Faction): void {
  const factionName = newFactionObject.name;
  const oldFactionObject = Factions[factionName];
  if (oldFactionObject) {
    newFactionObject.favor = oldFactionObject.favor;
    delete Factions[factionName];
  }
  Factions[newFactionObject.name] = newFactionObject;
}
