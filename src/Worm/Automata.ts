import { getRandomInt } from "../utils/helpers/getRandomInt";
import { isBipartite, nodeIndegree, nodeValue, shortestInput } from "./calculations";

export interface AutomataData {
	states: string[];
	symbols: string[];
	targetState: string;
	startState: string;
	transitions: Record<string, Record<string, string>>;
	properties: AutomataProperties;
}

export interface AutomataProperties {
	isBipartite: boolean;
	shortestInput: number;
	nodeValues: Record<string, number>;
	nodeIndegrees: Record<string, number>;
}

export const base64Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const chooseRandomState = (states: string[]) => states[Math.floor(Math.random() * states.length)];

export function AutomataFactory(completions: number): [AutomataData, [string, string]] {
	const numStates = getRandomInt(2, 5) * 5 + Math.floor(completions);
	const numSymbols = 2 + Math.floor(Math.log(numStates + 1));

	const states = Array.from({ length: numStates }, (_, i) => "s" + i.toString().padStart(Math.ceil(Math.log10(numStates)), "0"));
	const symbols = base64Characters.split("", numSymbols);

	const transitions = generateTransitions(states, symbols);

	const data: Omit<AutomataData, "properties"> = {
		states,
		targetState: states[states.length - 1],
		startState: states[0],
		symbols,
		transitions
	};

	const properties = calculateProperties(data);

	return [{
		...data,
		properties
	}, [chooseRandomState(states), chooseRandomState(states)]];
}

export function calculateProperties(data: Omit<AutomataData, "properties">): AutomataProperties {
	const bipartite = isBipartite(data.transitions);
	const input = shortestInput(data.transitions, data.startState, data.targetState);

	const values: Record<string, number> = {};
	const degrees: Record<string, number> = {};
	data.states.forEach(state => {
		values[state] = nodeValue(data.transitions, state, data.states);
		degrees[state] = nodeIndegree(data.transitions, state);
	});

	return {
		isBipartite: bipartite,
		shortestInput: input.length,
		nodeValues: values,
		nodeIndegrees: degrees
	}
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

/**Checks wether or not the input uses valid symbols */
export function isValidInput(data: AutomataData, input: string) {
	return input.split("").every(c => data.symbols.includes(c));
}
