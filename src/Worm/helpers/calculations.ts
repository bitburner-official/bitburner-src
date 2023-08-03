import { Multipliers, defaultMultipliers } from "../../PersonObjects/Multipliers";
import { Worm } from "../Worm";

export function isValidGuess(worm: Worm, guess: number[]) {
	const isRightLength = guess.length === worm.length;
	const allNumbersValid = guess.every(num => isValidNumber(worm, num));
	return isRightLength && allNumbersValid;
}

export function isValidNumber(worm: Worm, number: number) {
	return worm.minValue <= number && number <= worm.maxValue
}

export function calculatePerfectWorm(worm: Worm) {
	// The function used is a simplified form of a fourier series. (1 / numWaves) * globalScalar * [ sum_{1}^{numWaves} amplitude[numWave] * sin(numWave * frequency * (x + 1)) ]
	// Shifted to the left by 1, f(-1) = 0, for all variables
	const evalute = (x: number) =>
		(1 / worm.amplitudes.length)
		* worm.amplitude
		* worm.amplitudes.reduce((acc, cur, i) => acc + (cur * Math.sin(i * worm.frequency * (x + 1))), 0);

	return Array.from({ length: worm.length }, (_, i) => evalute(i));
}

// to alter the evaluation of the fitness, change this function.
// the current formula is (2-x)/(2+x*k), where k can be any number above -1.
export const fitnessFunction = (difference: number) => (1 - difference) / (1 + difference * 8);

export function calculateFitness(worm: Worm) {
	const perfectWorm = calculatePerfectWorm(worm);

	// console.log(perfectWorm);

	const difference = perfectWorm.reduce((acc, val, i) => acc + Math.abs(val - worm.guess[i]), 0);
	const fitness = fitnessFunction(difference / (2 * worm.length));

	return fitness;
}

export function calculateBonus(fitness: number, difficultyMultiplier: number) {
	// PLACEHOLDER
	return fitness * difficultyMultiplier * 15;
}

export function calculateWormMults(worm: Worm | null): Multipliers {
	const mults = defaultMultipliers();
	if (worm === null) return mults;

	return mults;
}