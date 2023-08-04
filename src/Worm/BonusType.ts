import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";
import { Difficulty } from "./Difficulty";
import { calculateBonus } from "./helpers/calculations";

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
export const bonusTypeNumbers = Object.keys(BonusType).filter(value =>
	typeof BonusType[value as keyof typeof BonusType] !== "number"
);

export function getMultiplier(type: BonusType, fitness: number, difficulty: Difficulty): Multipliers {
	const mult = defaultMultipliers();
	const power = calculateBonus(fitness, difficulty.bonusMultiplier);

	switch (type) {
		case BonusType.None: {
			break;
		}
		case BonusType.Hacking: {
			mult.hacking *= power;
			break;
		}
		case BonusType.Strength: {
			mult.strength *= power;
			break;
		}
		case BonusType.Defense: {
			mult.defense *= power;
			break;
		}
		case BonusType.Agility: {
			mult.agility *= power;
			break;
		}
		case BonusType.Dexterity: {
			mult.dexterity *= power;
			break;
		}
		case BonusType.Charisma: {
			mult.charisma *= power;
			break;
		}
		case BonusType.Rep: {
			mult.company_rep *= power;
			mult.faction_rep *= power;
			break;
		}
		case BonusType.Bladeburner: {
			mult.bladeburner_analysis *= power;
			mult.bladeburner_max_stamina *= power;
			mult.bladeburner_stamina_gain *= power;
			mult.bladeburner_success_chance *= power;
			break;
		}
		default: throw new Error(`Bonus "${type}" doesn't have a multiplier`);
	}

	return mult;
}

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
