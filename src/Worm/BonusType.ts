export enum BonusType {
	None,
	
	Bladeburner,
	Rep,
	Hacking,
	Strength,
	Defense,
	Agility,
	Dexterity,
	Charisma,
}

// All strings of the bonusType, like "None", "Bladeburner" etc.
export const bonusTypeStrings = Object.keys(BonusType).filter(value =>
	typeof BonusType[value as keyof typeof BonusType] === "number"
);

export function Bonus(type: BonusType): string {
  switch (type) {
		case BonusType.None: {
			return "no benefit";
		}
    case BonusType.Hacking: {
      return "+x% hacking skill";
    }
    case BonusType.Strength: {
      return "+x% strength skill";
    }
    case BonusType.Defense: {
      return "+x% defense skill";
    }
    case BonusType.Dexterity: {
      return "+x% dexterity skill";
    }
    case BonusType.Agility: {
      return "+x% agility skill";
    }
    case BonusType.Charisma: {
      return "+x% charisma skill";
    }
    case BonusType.Rep: {
      return "+x% reputation from factions and companies";
    }
    case BonusType.Bladeburner: {
      return "+x% all bladeburner stats";
    }
  }
  throw new Error("Calling bonus for BonusType that doesn't have an bonus: " + type);
}
