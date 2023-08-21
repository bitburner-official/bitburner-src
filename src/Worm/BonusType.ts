import { Player } from "@player";
import { Multipliers, defaultMultipliers, mergeMultipliers, scaleMultipliers } from "../PersonObjects/Multipliers";
import { Augmentations } from "../Augmentation/Augmentations";
import { Worm } from "./Worm";
import { calculateFitness } from "./calculations";
import { Growths } from "../Bladeburner/data/Growths";
import { BladeburnerConstants } from "../Bladeburner/data/Constants";

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
	INCREASED_MAINFRAME_VOLTAGE: 4,
	RAPID_ASSIMILATION: 5,
	TEMPORAL_RESONATOR: 6,
	RECORDLESS_CONTRACTING: 7
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
	},{
		id: Bonus.RAPID_ASSIMILATION,
		name: "Rapid assimilation",
		description: "applies queued augmentations immediately. x% queued augmentation effect",
		power: 20
	},{
		id: Bonus.TEMPORAL_RESONATOR,
		name: "Temporal resonator",
		description: "transfers +x% cycles of the worm to all sleeves",
		power: 200
	},{
		id: Bonus.RECORDLESS_CONTRACTING,
		name: "Recordless contracting",
		description: "Generates an additional +x% bladeburner contracts and operations",
		power: 100
	}
];

export const bonusMult = (effect: number): Record<typeof Bonus[keyof typeof Bonus], Partial<Multipliers> | null> => ({
	[Bonus.NONE]: {},
	[Bonus.CARDINAL_SIN]: { crime_karma_impact: effect },
	[Bonus.FAVORABLE_APPEARANCE]: { faction_rep: effect, company_rep: effect },
	[Bonus.SYNTHETIC_BLACK_FRIDAY]: {
		hacknet_node_core_cost: 1 / effect,
		hacknet_node_level_cost: 1 / effect,
		hacknet_node_purchase_cost: 1 / effect,
		hacknet_node_ram_cost: 1 / effect,

		server_cost: 1 / effect,
		home_ram_cost: 1 / effect,
		home_core_cost: 1 / effect,
	},
	[Bonus.INCREASED_MAINFRAME_VOLTAGE]: { game_tick_speed: effect },
	[Bonus.RAPID_ASSIMILATION]: (() => {
		let mults = defaultMultipliers();
		for (const queued of Player.queuedAugmentations) mults = mergeMultipliers(mults, Augmentations[queued.name].mults);
		return scaleMultipliers(mults, effect - 1);
	})(),
	[Bonus.TEMPORAL_RESONATOR]: null,
	[Bonus.RECORDLESS_CONTRACTING]: null,
});

export function applySpecialBonus(worm: Worm, numCycles = 1) {
	const effect = bonusMult(0)[worm.bonus.id];
	if (effect !== null) return;

	const power = getCurrentBonusPower(worm.bonus, worm.insight, calculateFitness(worm), worm.difficulty.bonusMultiplier);

	switch (worm.bonus.id) {
		case Bonus.TEMPORAL_RESONATOR: {
			for (const sleeve of Player.sleeves) sleeve.storedCycles += numCycles * (power - 1);
			break;
		}
		case Bonus.RECORDLESS_CONTRACTING: {
			if (Player.bladeburner === null) return;

			// Count increase for contracts/operations
			for (const contract of Object.values(Player.bladeburner.contracts)) {
				const growthF = Growths[contract.name];
				if (growthF === undefined) throw new Error(`growth formula for action '${contract.name}' is undefined`);

				contract.count += (numCycles / BladeburnerConstants.CyclesPerSecond) * growthF() * (power - 1) / BladeburnerConstants.ActionCountGrowthPeriod;
			}
			for (const op of Object.values(Player.bladeburner.operations)) {
				const growthF = Growths[op.name];
				if (growthF === undefined) throw new Error(`growth formula for action '${op.name}' is undefined`);
				op.count += (numCycles / BladeburnerConstants.CyclesPerSecond) * growthF() * (power - 1) / BladeburnerConstants.ActionCountGrowthPeriod;
			}
			break;
		}
		default: throw new Error(`Bonus #${worm.bonus.id} does not have a special implementation`);
	}
}

export const stringIsBonusKey = (s: string): s is keyof typeof Bonus => Object.keys(Bonus).indexOf(s) !== -1;
export const numberIsBonusValue = (n: number): n is typeof Bonus[keyof typeof Bonus] => Object.values(Bonus).indexOf(n as typeof Bonus[keyof typeof Bonus]) !== -1;

export function getCurrentBonusPower(data: BonusType, insight: number, fitness: number, bonusMultiplier: number) {
	return 1 + (
		((fitness * 0.6) + (insight * 0.4)) *
		bonusMultiplier *
		(data.power / 100)
	);
}

export function getMultiplier(data: BonusType, insight: number, fitness: number, bonusMultiplier: number): Multipliers | null {
	const mult = defaultMultipliers();
	const power = getCurrentBonusPower(data, insight, fitness, bonusMultiplier);
	const partial = bonusMult(power)[data.id];

	if (partial === null) return partial;

	return { ...mult, ...partial };
}