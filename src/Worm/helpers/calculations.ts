import { Worm } from "../Worm";

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