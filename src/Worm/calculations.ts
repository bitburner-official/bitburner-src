import { Player } from "@player";
import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";
import { getMultiplier } from "./BonusType";
import { Worm } from "./Worm";
import { calculateIntelligenceBonus } from "../PersonObjects/formulas/intelligence";
import { WormInputArray } from "@nsdefs";
import { isValidInput } from "./Automata";

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

export function parseWormInputArray(worm: Worm, v: string): WormInputArray | null {
	const parsedArray = v.split(",").map(s => s.trim());
	if (parsedArray.length !== 4) return null;
	const values: [boolean | null, string | null, number, number] = [
		parsedArray[0].toLowerCase() === "true" ? true : parsedArray[0].toLowerCase() === "false" ? false : null,
		isValidInput(worm.data, parsedArray[1]) ? parsedArray[1] : null,
		Number.parseInt(parsedArray[2]),
		Number.parseInt(parsedArray[3]),
	];
	if (values[0] === null || values[1] === null || Number.isNaN(values[2]) || Number.isNaN(values[3])) return null;
	return values as WormInputArray;
}

export function isBipartite(graph: Record<string, Record<string, string>>) {
  const sets = new Map<string, boolean>();

  function dfs(node: string, currentSet: boolean) {
    if (sets.has(node)) {
      return sets.get(node) === currentSet;
    }

    sets.set(node, currentSet);

    for (const edge in graph[node]) {
      const neighbor = graph[node][edge];
      if (!dfs(neighbor, !currentSet)) {
        return false;
      }
    }

    return true;
  }

  for (const vertex in graph) {
    if (!sets.has(vertex)) {
      if (!dfs(vertex, false)) {
        return false;
      }
    }
  }

  return true;
}

export function nodeIndegree(graph: Record<string, Record<string, string>>, node: string): number {
	let count = 0;
	for (const edge in graph) {
		for (const vertex in graph[edge]) {
			count += Number(graph[edge][vertex] === node);
		}
	}

	return count;
}

export function nodeValue(graph: Record<string, Record<string, string>>, node: string, orderedNodes: string[]): number {
	const startingValue = orderedNodes.indexOf(node);
	if (startingValue === -1) throw new Error(`Edge ${node} is not present in the list of ordered nodes.`);
	const values: number[] = [];
	for (const vertex in graph[node]) {
		const index = orderedNodes.indexOf(graph[node][vertex]);
		if (index === -1) throw new Error(`Edge ${graph[node][vertex]} is not present in the list of ordered nodes.`);
		values.push(index - startingValue);
	}
	return Math.max(...values);
}

export function shortestInput(graph: Record<string, Record<string, string>>, startingNode: string, targetNode: string) {
	// Dijkstra using a simple array
	let unvisited = Object.keys(graph).filter(s => s !== startingNode);

	const distances: Record<string, number> = {};
	const paths: Record<string, string> = {};
	for (const edge in graph) {
		distances[edge] = Number.MAX_SAFE_INTEGER;
		paths[edge] = "";
	}
	distances[startingNode] = 0;

	let currentNode = startingNode;

	while (distances[targetNode] === Number.MAX_SAFE_INTEGER && unvisited.length > 0) {
		for (const vertex in graph[currentNode]) {
			const newDistance = distances[currentNode] + 1;
			if (distances[graph[currentNode][vertex]] > newDistance) {
				distances[graph[currentNode][vertex]] =  newDistance;
				paths[graph[currentNode][vertex]] = paths[currentNode] + vertex;
			}
		}
		unvisited = unvisited.filter(s => s !== currentNode);
		currentNode = unvisited.reduce((acc, cur) => distances[acc] > distances[cur] ? cur : acc);
	}

	return paths[targetNode];
}