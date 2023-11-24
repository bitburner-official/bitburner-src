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
	const numStates = getRandomInt(2, 5) * 3 + Math.floor(completions);
	const numSymbols = 2 + Math.floor(Math.log10(numStates + 1));

	const states = Array.from({ length: numStates }, (_, i) => "s" + i.toString().padStart(Math.ceil(Math.log10(numStates)), "0"));
	const symbols = base64Characters.split("", numSymbols);

	const transitions = generateGraph(states, symbols);

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

export function generateGraph(states: string[], symbols: string[]): Record<string, Record<string, string>> {
	const isBipartite = Math.random() > 0.5;

	const connectionRange = symbols.length;

	const transitions: Record<string, Record<string, string>> = {};

	// creates a path that goes through all states
	for (let i = 0; i < states.length - 1; i++) transitions[states[i]] = {
		[symbols[Math.floor(Math.random() * symbols.length)]]: states[i + 1]
	};
	// the last state loops back to the first (or second if graph should be bipartite and states count is odd)
	transitions[states[states.length - 1]] = {
		[symbols[Math.floor(Math.random() * symbols.length)]]: states[isBipartite ? states.length % 2 : 0]
	};

	for (let i = 0; i < states.length; i++) {
		const possibleTargets = [];

		// sets the lower/upper bound to the next possible state that is also odd/even.
		const lowerBound = Math.max(
			isBipartite ? (i + 1) % 2 : 0,
			(i - connectionRange) + (isBipartite ? ((i - connectionRange) % 2) ^ ((i + 1) % 2) : 0)
		);
		const upperBound = Math.min(
			isBipartite ? states.length - ((states.length % 2) ^ ((i + 1) % 2)) : states.length,
			((i + connectionRange) - (isBipartite ? ((i + connectionRange) % 2) ^ ((i + 1) % 2) : 0)) + 1
		);
		for (
			let j = lowerBound;
			j < upperBound;
			isBipartite ? j += 2 : j++
		) {
			if (j !== i) possibleTargets.push(states[j]);
		}

		for (const symbol of symbols) {
			if (transitions[states[i]][symbol] !== undefined) continue;

			transitions[states[i]][symbol] = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
		}
	}

	return transitions;
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

export function evaluateInput(data: AutomataData, input: string) {
	let currentState = data.startState;

	for (let i = 0; i < input.length; i++) currentState = data.transitions[currentState][input[i]];

	return currentState;
}

/**Checks wether or not the input uses valid symbols */
export function isValidInput(data: AutomataData, input: string) {
	return input.split("").every(c => data.symbols.includes(c));
}
