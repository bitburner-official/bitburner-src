import { FactionName, GangMemberType } from "@enums";

interface GangFactionInfo {
  territoryPowerMultiplier: number;
  maxMembers: {
    [Type in GangMemberType]: number;
  };
}

export const AllGangFactionInfo: Record<string, GangFactionInfo> = {
  [FactionName.SlumSnakes]: {
    territoryPowerMultiplier: 1,
    maxMembers: {
      // 30 combat
      [GangMemberType.Enforcer]: 9,
      [GangMemberType.Hacker]: 3,
    },
  },
  [FactionName.Tetrads]: {
    territoryPowerMultiplier: 3,
    maxMembers: {
      // 75 combat
      [GangMemberType.Enforcer]: 10,
      [GangMemberType.Hacker]: 3,
    },
  },
  [FactionName.SpeakersForTheDead]: {
    territoryPowerMultiplier: 4,
    maxMembers: {
      // 300 combat, 100 hacking
      [GangMemberType.Enforcer]: 10,
      [GangMemberType.Hacker]: 4,
    },
  },

  [FactionName.NiteSec]: {
    territoryPowerMultiplier: 2,
    maxMembers: {
      // ~200 hacking
      [GangMemberType.Enforcer]: 4,
      [GangMemberType.Hacker]: 10,
    },
  },
  [FactionName.TheBlackHand]: {
    territoryPowerMultiplier: 3,
    maxMembers: {
      // ~350 hacking
      [GangMemberType.Enforcer]: 6,
      [GangMemberType.Hacker]: 10,
    },
  },

  [FactionName.TheSyndicate]: {
    territoryPowerMultiplier: 4,
    maxMembers: {
      // 200 hacking and combat
      [GangMemberType.Enforcer]: 9,
      [GangMemberType.Hacker]: 9,
    },
  },
  [FactionName.TheDarkArmy]: {
    territoryPowerMultiplier: 4,
    maxMembers: {
      // 300 hacking and combat
      [GangMemberType.Enforcer]: 10,
      [GangMemberType.Hacker]: 10,
    },
  },
};
