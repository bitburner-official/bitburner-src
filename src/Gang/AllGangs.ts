import { FactionName } from "@enums";
import { Reviver } from "../utils/JSONReviver";

interface GangTerritory {
  power: number;
  territory: number;
}

export let AllGangs: Record<string, GangTerritory> = defaultGangs();

function defaultGangs(): Record<string, GangTerritory> {
  return {
    [FactionName.SlumSnakes]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.Tetrads]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.TheSyndicate]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.TheDarkArmy]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.SpeakersForTheDead]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.NiteSec]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.TheBlackHand]: {
      power: 1,
      territory: 1 / 7,
    },
  };
}

export function resetGangs(): void {
  AllGangs = defaultGangs();
}

export function loadAllGangs(saveString: string): void {
  AllGangs = JSON.parse(saveString, Reviver);
}
