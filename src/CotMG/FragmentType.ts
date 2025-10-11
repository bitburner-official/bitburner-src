// Numeric enum
export enum FragmentType {
  HackingSpeed = 3,
  HackingMoney = 4,
  HackingGrow = 5,
  Hacking = 6,
  Strength = 7,
  Defense = 8,
  Dexterity = 9,
  Agility = 10,
  Charisma = 11,
  HacknetMoney = 12,
  HacknetCost = 13,
  Rep = 14,
  WorkMoney = 15,
  Crime = 16,
  Bladeburner = 17,
  // Utility fragments.
  Booster = 18,
}

export function Effect(type: FragmentType): string {
  switch (type) {
    case FragmentType.HackingSpeed: {
      return "+x% faster hack(), grow(), and weaken()";
    }
    case FragmentType.HackingMoney: {
      return "+x% hack() power";
    }
    case FragmentType.HackingGrow: {
      return "+x% grow() power";
    }
    case FragmentType.Hacking: {
      return "+x% hacking experience and skill level";
    }
    case FragmentType.Strength: {
      return "+x% strength experience and skill level";
    }
    case FragmentType.Defense: {
      return "+x% defense experience and skill level";
    }
    case FragmentType.Dexterity: {
      return "+x% dexterity experience and skill level";
    }
    case FragmentType.Agility: {
      return "+x% agility experience and skill level";
    }
    case FragmentType.Charisma: {
      return "+x% charisma experience and skill level";
    }
    case FragmentType.HacknetMoney: {
      return "+x% hacknet production";
    }
    case FragmentType.HacknetCost: {
      return "-x% cheaper hacknet costs";
    }
    case FragmentType.Rep: {
      return "+x% reputation from factions and companies";
    }
    case FragmentType.WorkMoney: {
      return "+x% work money";
    }
    case FragmentType.Crime: {
      return "+x% crime money and success chance";
    }
    case FragmentType.Bladeburner: {
      return "+x% bladeburner stats (max stamina, stamina gain, Field Analysis effectiveness, action success chance)";
    }
    case FragmentType.Booster: {
      return "1.1x adjacent fragment power";
    }
  }
}
