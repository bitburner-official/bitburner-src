import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";

export interface BonusType {
	id: typeof Bonus[keyof typeof Bonus];
	name: string;
	description: string;

	power: number;
}

export const Bonus = {
	NONE: 0,

	CARDINAL_SIN: 1,
	FAVORABLE_APPEARANCE: 2,
	SYNTHETIC_BLACK_FRIDAY: 3,
	INCREASED_MAINFRAME_VOLTAGE: 4
} as const;

export const bonuses: BonusType[] = [
	{
		id: Bonus.NONE,
		name: "None",
		description: "no benefit",
		power: 0
	},{
		id: Bonus.CARDINAL_SIN,
		name: "Cardinal sin",
		description: "+x% crime impact on karma",
		power: 40
	},{
		id: Bonus.FAVORABLE_APPEARANCE,
		name: "Favorable appearance",
		description: "+x% reputation from factions and companies",
		power: 75
	},{
		id: Bonus.SYNTHETIC_BLACK_FRIDAY,
		name: "Synthetic black friday",
		description: "-x% hacknet costs, purchased server costs, home ram and home core costs",
		power: 15
	},{
		id: Bonus.INCREASED_MAINFRAME_VOLTAGE,
		name: "Increased mainframe voltage",
		description: "+x% game cycles per process",
		power: 10
	}
];

export const bonusMult = (power: number): Record<typeof Bonus[keyof typeof Bonus], Partial<Multipliers>> => ({
	[Bonus.NONE]: {},
	[Bonus.CARDINAL_SIN]: { crime_karma_impact: power },
	[Bonus.FAVORABLE_APPEARANCE]: { faction_rep: power, company_rep: power },
	[Bonus.SYNTHETIC_BLACK_FRIDAY]: {
		hacknet_node_core_cost: 1 / power,
		hacknet_node_level_cost: 1 / power,
		hacknet_node_purchase_cost: 1 / power,
		hacknet_node_ram_cost: 1 / power,

		server_cost: 1 / power,
		home_ram_cost: 1 / power,
		home_core_cost: 1 / power,
	},
	[Bonus.INCREASED_MAINFRAME_VOLTAGE]: { game_tick_speed: power },
});

export const stringIsBonusKey = (s: string): s is keyof typeof Bonus => Object.keys(Bonus).indexOf(s) !== -1;
export const numberIsBonusValue = (n: number): n is typeof Bonus[keyof typeof Bonus] => Object.values(Bonus).indexOf(n as typeof Bonus[keyof typeof Bonus]) !== -1;

export function getCurrentBonusPower(data: BonusType, insight: number, fitness: number, bonusMultiplier: number) {
	return 1 + (
		((fitness * 0.6) + (insight * 0.4)) *
		bonusMultiplier *
		(data.power / 100)
	);
}

export function getMultiplier(data: BonusType, insight: number, fitness: number, bonusMultiplier: number): Multipliers {
	const mult = defaultMultipliers();
	const power = getCurrentBonusPower(data, insight, fitness, bonusMultiplier);
	const partial = bonusMult(power)[data.id];

	return { ...mult, ...partial };
}