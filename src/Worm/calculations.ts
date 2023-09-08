import { Player } from "@player";
import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";
import { getMultiplier } from "./BonusType";
import { Worm } from "./Worm";
import { calculateIntelligenceBonus } from "../PersonObjects/formulas/intelligence";

export const getGuessTime = (threads: number) => 60 * 1000 / (threads * calculateIntelligenceBonus(Player.skills.intelligence, 1));

export function calculateWormMults(worm: Worm | null): Multipliers {
	if (worm === null) return defaultMultipliers();

	const effect = getMultiplier(worm.bonus, worm.completions);

	if (effect === null) {
		return defaultMultipliers();
	} else {
		return effect;
	}
}