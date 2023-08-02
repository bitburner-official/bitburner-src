import { Multipliers, defaultMultipliers } from "../../PersonObjects/Multipliers";
import { Worm } from "../Worm";

export function isValidGuess(worm: Worm, guess: number[]) {
	const isRightLength = guess.length === worm.wormLength;
	const allNumbersValid = guess.every(num => isValidNumber(worm, num));
	return isRightLength && allNumbersValid;
}

export function isValidNumber(worm: Worm, number: number) {
	return worm.minValue <= number && number <= worm.maxValue
}

export function calculatePerfectWorm(wormLength: number) {
	return Array.from({ length: wormLength }, () => Math.random());
}

export function calculateFitness(worm: Worm) {
	const perfectWorm = calculatePerfectWorm(worm.wormLength);

	// Might want to square difference ?
	const difference = perfectWorm.reduce((acc, val, i) => acc + Math.abs(val - worm.guess[i]), 0);
	const fitness = (worm.wormLength - difference) / worm.wormLength;

	if (fitness < 0) console.error("Difference greater than worm length: FITNESS, DIFFERENCE", fitness, difference);

	return fitness;
}

export function calculateBonus(fitness: number, difficultyMultiplier: number) {
	return fitness * difficultyMultiplier;
}

export function calculateWormMults(worm: Worm | null): Multipliers {
	const mults = defaultMultipliers();
	if (worm === null) return mults;

	return mults;
}