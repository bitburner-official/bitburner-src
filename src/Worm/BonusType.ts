import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";
import { Difficulty } from "./Difficulty";
import { calculateBonus } from "./helpers/calculations";

export enum BonusType {
	None,
	
	// Mock
	Bladeburner,
	Rep,
	Hacking,
	Strength,
	Defense,
	Agility,
	Dexterity,
	Charisma,

	// Actual
	"Cardinal sin",
	"Favorable appearance",
	"Synthetic black friday"
}

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

		case BonusType["Cardinal sin"]: {
			mult.crime_karma_impact *= power;
			break;
		}
		case BonusType["Favorable appearance"]: {
			mult.faction_rep *= power;
			mult.company_rep *= power;
			break;
		}
		case BonusType["Synthetic black friday"]: {
			mult.hacknet_node_core_cost /= power;
			mult.hacknet_node_level_cost /= power;
			mult.hacknet_node_purchase_cost /= power;
			mult.hacknet_node_ram_cost /= power;

			mult.server_cost /= power;
			mult.home_ram_cost /= power;
			mult.home_core_cost /= power;
			
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

		case BonusType["Cardinal sin"]: {
			return "+x% crime impact on karma"; // "+x% karma gain" "+x% karma loss"
		}
		case BonusType["Favorable appearance"]: {
			return "+x% reputation from factions and companies";
		}
		case BonusType["Synthetic black friday"]: {
			return "-x% hacknet costs, purchased server costs, home ram and home core costs";
		}
  }
  throw new Error("Calling bonus for BonusType that doesn't have an bonus: " + type);
}
