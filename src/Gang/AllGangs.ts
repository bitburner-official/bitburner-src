import { FactionName } from "@enums";
import { Reviver } from "../utils/JSONReviver";

interface GangTerritory {
  territoryPower: number;
  territory: number;
}

export let AllGangs: Record<string, GangTerritory> = defaultGangs();

function defaultGangs(): Record<string, GangTerritory> {
  return {
    [FactionName.SlumSnakes]: {
      territoryPower: 1,
      territory: 1 / 7,
    },
    [FactionName.Tetrads]: {
      territoryPower: 1,
      territory: 1 / 7,
    },
    [FactionName.TheSyndicate]: {
      territoryPower: 1,
      territory: 1 / 7,
    },
    [FactionName.TheDarkArmy]: {
      territoryPower: 1,
      territory: 1 / 7,
    },
    [FactionName.SpeakersForTheDead]: {
      territoryPower: 1,
      territory: 1 / 7,
    },
    [FactionName.NiteSec]: {
      territoryPower: 1,
      territory: 1 / 7,
    },
    [FactionName.TheBlackHand]: {
      territoryPower: 1,
      territory: 1 / 7,
    },
  }
}

export function resetGangs(): void {
  AllGangs = defaultGangs();
}

export function loadAllGangs(saveString: string): void {
  AllGangs = JSON.parse(saveString, Reviver);
}
