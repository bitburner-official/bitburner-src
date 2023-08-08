import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";
import { Difficulty } from "./Difficulty";

export enum BonusType {
	None,

	"Cardinal sin",
	"Favorable appearance",
	"Synthetic black friday",
	"Increased mainframe voltage"
}

// Maps every BonusType to a percentage value (100 being 100%)
export const bonusTypePower: Record<BonusType, number> = {
	[BonusType.None]: 0,
	[BonusType["Cardinal sin"]]: 40,
	[BonusType["Favorable appearance"]]: 75,
	[BonusType["Synthetic black friday"]]: 15,
	[BonusType["Increased mainframe voltage"]]: 10,
};

export const bonusTypeNumbers = Object.keys(BonusType).filter(value =>
	typeof BonusType[value as keyof typeof BonusType] !== "number"
);

export const stringIsBonusTypeKey = (s: string): s is keyof typeof BonusType => Object.values(BonusType).indexOf(s) !== -1;

export function getCurrentBonusPower(type: BonusType, fitness: number, bonusMultiplier: number) {
	return 1 + fitness * bonusMultiplier * (bonusTypePower[type] / 100);
}

export function getMultiplier(type: BonusType, fitness: number, difficulty: Difficulty): Multipliers {
	const mult = defaultMultipliers();
	const power = getCurrentBonusPower(type, fitness, difficulty.bonusMultiplier);

	switch (type) {
		case BonusType.None: {
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
		case BonusType["Increased mainframe voltage"]: {
			mult.game_tick_speed *= power;
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

		case BonusType["Cardinal sin"]: {
			return "+x% crime impact on karma"; // "+x% karma gain" "+x% karma loss"
		}
		case BonusType["Favorable appearance"]: {
			return "+x% reputation from factions and companies";
		}
		case BonusType["Synthetic black friday"]: {
			return "-x% hacknet costs, purchased server costs, home ram and home core costs";
		}
		case BonusType["Increased mainframe voltage"]: {
			return "+x% game cycles per process";
		}
  }
  throw new Error("Calling bonus for BonusType that doesn't have an bonus: " + type);
}
