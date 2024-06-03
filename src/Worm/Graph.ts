import { WormParams } from "@nsdefs";
import { depthFirstSearchEnumeration, isBipartite, nodeIndegree, nodeValue, shortestInput } from "./calculations";
import { generateGraph } from "./GraphGenerator";
import { getRandomIntInclusive } from "../utils/helpers/getRandomIntInclusive";

export interface WormGuess {
  path: string;
  bipartite: boolean;
  value: number;
  indegree: number;
  dfsState: string;
}

export interface GraphData {
  states: string[];
  symbols: string[];
  targetState: string;
  startState: string;
  transitions: Record<string, Record<string, string>>;
  properties: GraphProperties;
}

export interface GraphProperties {
  pathLength: number;
  bipartite: boolean;
  values: Record<string, number>;
  indegrees: Record<string, number>;
  dfsOrder: string[];
}

export function getWormSize(completions: number) {
  const size = Math.floor((Math.random() + 0.5) * completions) + getRandomIntInclusive(20, 40);

  const states = Math.max(6, Math.floor((Math.random() + 1.5) * Math.sqrt(size)));
  const symbols = Math.max(2, Math.floor((size / states) * (Math.random() * 0.25 + 0.5)));

  return [states, symbols];
}

export const base64Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const chooseRandomState = (states: string[]) => states[Math.floor(Math.random() * states.length)];

export function WormDataFactory(completions: number): {
  graph: GraphData;
  guess: WormGuess;
  params: WormParams;
} {
  const [numStates, numSymbols] = getWormSize(completions);

  const states = Array.from(
    { length: numStates },
    (_, i) => "s" + i.toString().padStart(Math.ceil(Math.log10(numStates)), "0"),
  );
  const symbols = base64Characters.split("", numSymbols);

  const transitions = generateGraph(states, symbols);

  const graph: Omit<GraphData, "properties"> = {
    states,
    targetState: states[states.length - 1],
    startState: states[0],
    symbols,
    transitions,
  };

  const properties = calculateProperties(graph);

  return {
    graph: {
      ...graph,
      properties,
    },
    guess: {
      path: "",
      value: -1,
      indegree: -1,
      bipartite: false,
      dfsState: "",
    },
    params: {
      indegree: chooseRandomState(states),
      value: chooseRandomState(states),
      dfsOrder: Math.floor(Math.random() * states.length),
    },
  };
}

export function calculateProperties(graph: Omit<GraphData, "properties">): GraphProperties {
  const bipartite = isBipartite(graph.transitions);
  const input = shortestInput(graph.transitions, graph.startState, graph.targetState);

  const values: Record<string, number> = {};
  const degrees: Record<string, number> = {};
  graph.states.forEach((state) => {
    values[state] = nodeValue(graph.transitions, state, graph.states);
    degrees[state] = nodeIndegree(graph.transitions, state);
  });

  const dfs = depthFirstSearchEnumeration(graph.transitions, graph.startState, graph.symbols);

  return {
    pathLength: input.length,
    bipartite: bipartite,
    values: values,
    indegrees: degrees,
    dfsOrder: dfs,
  };
}

export function evaluateInput(graph: GraphData, input: string) {
  let currentState = graph.startState;

  for (let i = 0; i < input.length; i++) {
    if (currentState === undefined) break;
    currentState = graph.transitions[currentState]?.[input[i]];
  }

  if (currentState === undefined) return "snull";
  return currentState;
}

// left here for debugging purposes, used to transform graph for online visualization sites
function __graphRepToAdj(graph: Record<string, Record<string, string>>, states: string[]) {
  const out: string[] = [];

  for (const row of states) {
    const values = states.map((col) => (Object.values(graph[row]).includes(col) ? "1" : "0"));
    out.push(values.join(", "));
  }

  return out.join("\n");
}
