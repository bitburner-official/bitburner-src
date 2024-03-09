import { FactionName } from "@enums";

interface GangFactionInfo {
  territoryPowerMultiplier: number;
  numEnforcers: number;
  numHackers: number;
}

export const AllGangFactionInfo: Record<string, GangFactionInfo> = {
  [FactionName.SlumSnakes]: {
    territoryPowerMultiplier: 1, numEnforcers: 9, numHackers: 3 // 30 combat
  },
  [FactionName.Tetrads]: {
    territoryPowerMultiplier: 3, numEnforcers: 10, numHackers: 3 // 75 combat
  },
  [FactionName.SpeakersForTheDead]: {
    territoryPowerMultiplier: 4, numEnforcers: 10, numHackers: 4 // 300 combat, 100 hacking
  },
  
  [FactionName.NiteSec]: {
    territoryPowerMultiplier: 2, numEnforcers: 4, numHackers: 10 // ~200 hacking
  },
  [FactionName.TheBlackHand]: {
    territoryPowerMultiplier: 3, numEnforcers: 6, numHackers: 10 // ~350 hacking
  },

  [FactionName.TheSyndicate]: {
    territoryPowerMultiplier: 4, numEnforcers: 9, numHackers: 9 // 200 hacking and combat
  },
  [FactionName.TheDarkArmy]: {
    territoryPowerMultiplier: 4, numEnforcers: 10, numHackers: 10 // 300 hacking and combat
  },
}
