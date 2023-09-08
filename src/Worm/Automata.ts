import { getRandomInt } from "../utils/helpers/getRandomInt";

export interface AutomataData {
	states: string[];
	symbols: string[];
	targetStates: string[];
	startState: string;
	transitions: Record<string, Record<string, string>>;
}

export const base64Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function AutomataFactory(completions: number): AutomataData {
	const numStates = getRandomInt(2, 5) * 5 + completions;
	const numSymbols = 2 + Math.floor(Math.log(numStates + 1));

	const states = Array.from({ length: numStates }, (_, i) => "s" + i.toString().padStart(4, "0"));
	const symbols = base64Characters.split("", numSymbols);

	const transitions = generateTransitions(states, symbols);

	return {
		states,
		targetStates: [states[states.length - 1]],
		startState: states[0],
		symbols,
		transitions
	};
}

export function generateTransitions(states: string[], symbols: string[]): Record<string, Record<string, string>> {
	const transitions: Record<string, Record<string, string>> = {};

	// Creates a transition to every state
	for (let i = 0; i < states.length - 1; i++) transitions[states[i]] = {
		[symbols[Math.floor(Math.random() * symbols.length)]]: states[i + 1]
	};
	transitions[states[states.length - 1]] = { [symbols[Math.floor(Math.random() * symbols.length)]]: states[0] };

	// Creates a transition for every symbol on every possible state that hasn't been mapped yet
	for (let i = 0; i < states.length; i++) {
		for (const symbol of symbols) {
			if (transitions[states[i]][symbol] !== undefined) continue;

			// the target of of the symbol from the current state is limited to a state in a certain range
			const target = Math.min(states.length - 1, Math.max(0, i + Math.round((Math.random() - 0.5) * 2 * symbols.length)));
			transitions[states[i]][symbol] = states[target];
		}
	}

	return transitions;
}

export function evaluateInput(data: AutomataData, input: string) {
	let currentState = data.startState;

	for (let i = 0; i < input.length; i++) currentState = data.transitions[currentState][input[i]];

	return currentState;
}

/**Checks wether or not the input leads to the desired final state */
export function isCorrectInput(data: AutomataData, input: string) {
	const finalState = evaluateInput(data, input);

	return data.targetStates.includes(finalState);
}

/**Checks wether or not the input uses valid symbols */
export function isValidInput(data: AutomataData, input: string) {
	return input.split("").every(c => data.symbols.includes(c));
}
