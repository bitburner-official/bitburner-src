import type { FragmentType } from "@nsdefs";

// Numeric enum
export const FragmentTypeEnum = {
  HackingSpeed: 3,
  HackingMoney: 4,
  HackingGrow: 5,
  Hacking: 6,
  Strength: 7,
  Defense: 8,
  Dexterity: 9,
  Agility: 10,
  Charisma: 11,
  HacknetMoney: 12,
  HacknetCost: 13,
  Rep: 14,
  WorkMoney: 15,
  Crime: 16,
  Bladeburner: 17,
  // Utility fragments.
  Booster: 18,
} as const;

export function Effect(type: FragmentType): string {
  switch (type) {
    case FragmentTypeEnum.HackingSpeed: {
      return "+x% faster hack(), grow(), and weaken()";
    }
    case FragmentTypeEnum.HackingMoney: {
      return "+x% hack() power";
    }
    case FragmentTypeEnum.HackingGrow: {
      return "+x% grow() power";
    }
    case FragmentTypeEnum.Hacking: {
      return "+x% hacking experience and skill level";
    }
    case FragmentTypeEnum.Strength: {
      return "+x% strength experience and skill level";
    }
    case FragmentTypeEnum.Defense: {
      return "+x% defense experience and skill level";
    }
    case FragmentTypeEnum.Dexterity: {
      return "+x% dexterity experience and skill level";
    }
    case FragmentTypeEnum.Agility: {
      return "+x% agility experience and skill level";
    }
    case FragmentTypeEnum.Charisma: {
      return "+x% charisma experience and skill level";
    }
    case FragmentTypeEnum.HacknetMoney: {
      return "+x% hacknet production";
    }
    case FragmentTypeEnum.HacknetCost: {
      return "-x% cheaper hacknet costs";
    }
    case FragmentTypeEnum.Rep: {
      return "+x% reputation from factions and companies";
    }
    case FragmentTypeEnum.WorkMoney: {
      return "+x% work money";
    }
    case FragmentTypeEnum.Crime: {
      return "+x% crime money and success chance";
    }
    case FragmentTypeEnum.Bladeburner: {
      return "+x% bladeburner stats (max stamina, stamina gain, Field Analysis effectiveness, action success chance)";
    }
    case FragmentTypeEnum.Booster: {
      return "1.1x adjacent fragment power";
    }
  }
}
