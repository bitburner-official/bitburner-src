import { Multipliers, defaultMultipliers } from "../../PersonObjects/Multipliers";
import { getMultiplier } from "../BonusType";
import { Worm } from "../Worm";

export function isValidGuess(worm: Worm, guess: number[]) {
	const isRightLength = guess.length === worm.length;
	const allNumbersValid = guess.every(num => isValidNumber(worm, num));
	return isRightLength && allNumbersValid;
}

export function checkValidGuess(worm: Worm, guess: number[]) {
	const isRightLength = guess.length === worm.length;

	if (!isRightLength) throw new Error(`Guess is not the right length, is: ${guess.length}, needs to be: ${worm.length}`);

	const allNumbersValid = guess.every(num => isValidNumber(worm, num));
	if (!allNumbersValid) {
		const pos = guess.find(num => !isValidNumber(worm, num));
		throw new Error(`Guess has invalid entries. At pos ${pos}, val: ${pos !== undefined ? guess[pos] : undefined}`);
	}
}

export function formatWormNumber(number: number) {
	return Math.round(number * 1000) / 1000;
}

export function isValidNumber(worm: Worm, number: number) {
	return worm.minValue <= number && number <= worm.maxValue
}

export function calculatePerfectWorm(worm: Worm) {
	// \frac{1}{\operatorname{length}\left(l\right)}\sum_{n=1}^{\operatorname{length}\left(l\right)}l\left[n\right]\sin\left(nw\left(x+s\right)\right)
	// s = worm.shift
	// l = worm.amplitudes
	// w = worm.frequency
	const evalute = (x: number) =>
		(1 / worm.amplitudes.length)
		* worm.amplitude
		* worm.amplitudes.reduce((acc, cur, i) => acc + (cur * Math.sin(i * worm.frequency * (x + worm.shift))), 0);

	return Array.from({ length: worm.length }, (_, i) => formatWormNumber(evalute(i)));
}

export const getGuessTime = (threads: number) => 60 * 1000 / threads;

// The formula needs to have these requirements:
// f(0) = 1
// 2. Range [0, 1] for x >= 0
// 3. (strictly) monotonically decreasing
export const fitnessFunction = (difference: number) => 1 / Math.exp(difference);

export function calculateFitness(worm: Worm) {
	const perfectWorm = calculatePerfectWorm(worm);

	// console.log(perfectWorm);

	const difference = perfectWorm.reduce((acc, val, i) => acc + Math.abs(val - worm.guess[i]), 0);
	const fitness = fitnessFunction(difference);

	return fitness;
}

export function calculateWormMults(worm: Worm | null): Multipliers {
	if (worm === null) return defaultMultipliers();

	return getMultiplier(worm.bonus, calculateFitness(worm), worm.difficulty);
}