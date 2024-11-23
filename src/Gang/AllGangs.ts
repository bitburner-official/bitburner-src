import { FactionName } from "@enums";
import { Reviver } from "../utils/GenericReviver";

interface GangTerritory {
  power: number;
  territory: number;
}

function getDefaultAllGangs() {
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

export let AllGangs: Record<string, GangTerritory> = getDefaultAllGangs();

export function resetGangs(): void {
  AllGangs = getDefaultAllGangs();
}

export function loadAllGangs(saveString: string): void {
  AllGangs = JSON.parse(saveString, Reviver);
}

export function getClashWinChance(thisGang: string, otherGang: string): number {
  const thisGangPower = AllGangs[thisGang].power;
  const otherGangPower = AllGangs[otherGang].power;
  return thisGangPower / (thisGangPower + otherGangPower);
}
