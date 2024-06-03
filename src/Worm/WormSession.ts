import { WormSessionEvents } from "./WormEvents";
import { Settings } from "../Settings/Settings";
import { GraphData, WormDataFactory, WormGuess, evaluateInput } from "./Graph";
import { worm, type Worm } from "./Worm";
import { WormParams } from "@nsdefs";
import { WORM_CREATE_COOLDOWN, WORM_SOLVE_COOLDOWN, wormTestingRewardPenalty } from "./calculations";

export const currentWormSessions = new Map<number, WormSession>();
export const finishedWormSessions: WormSession[] = [];

export let wormUISession: WormSession | null = null;
export const finishedWormUISessions: WormSession[] = [];

export let lastWormSolve = 0;
export let lastWormCreate = 0;

export function isWormOnSolveCooldown() {
  return lastWormSolve + WORM_SOLVE_COOLDOWN > Date.now();
}

export function isWormOnCreateCooldown() {
  return lastWormCreate + WORM_CREATE_COOLDOWN > Date.now();
}

export function getWormUISession() {
  if (worm === null) throw new Error("Cannot access Worm. Worm is null.");
  if (wormUISession === null) wormUISession = new WormSession(worm);
  return wormUISession;
}

export function resetWormUISession() {
  wormUISession = null;
}

export class WormSession {
  identifier: number;

  graph: GraphData;
  guess: WormGuess;
  params: WormParams;

  startTime: number;
  finishTime: number | null;

  testsDone: number;

  constructor(worm: Worm) {
    lastWormCreate = Date.now();
    this.identifier = lastWormCreate;

    const data = WormDataFactory(worm.completions);
    this.graph = data.graph;
    this.guess = data.guess;
    this.params = data.params;

    this.startTime = Date.now();
    this.finishTime = null;

    this.testsDone = 0;
  }

  evaluate(input: string, userInput: boolean) {
    if (userInput) this.testsDone += 1;
    return evaluateInput(this.graph, input);
  }

  isPathCorrect() {
    return (
      this.guess.path.length === this.graph.properties.pathLength &&
      this.evaluate(this.guess.path, false) === this.graph.targetState
    );
  }

  isBipartiteCorrect() {
    return this.guess.bipartite === this.graph.properties.bipartite;
  }

  isNodeValueCorrect() {
    return this.guess.value === this.graph.properties.values[this.params.value];
  }

  isNodeIndegreeCorrect() {
    return this.guess.indegree === this.graph.properties.indegrees[this.params.indegree];
  }

  isDFSStateCorrect() {
    return this.guess.dfsState === this.graph.properties.dfsOrder[this.params.dfsOrder];
  }

  solve() {
    if (this.finishTime !== null) throw new Error("Trying to solve Worm Session. Session has already ended.");
    lastWormSolve = Date.now();
    this.finishTime = lastWormSolve;

    return this.getReward();
  }

  getMaximumReward() {
    return wormTestingRewardPenalty(this.testsDone, this.graph.states.length * this.graph.symbols.length);
  }

  getReward() {
    const comparisons = [
      this.isPathCorrect(),
      this.isBipartiteCorrect(),
      this.isNodeValueCorrect(),
      this.isNodeIndegreeCorrect(),
      this.isDFSStateCorrect(),
    ];

    if (!comparisons[0]) return 0;

    const amountCorrect = comparisons.filter((b) => b).length;
    const rewardValue = amountCorrect / comparisons.length;

    return rewardValue * this.getMaximumReward();
  }
}

export function applyWormSessionReward(reward: number) {
  if (worm === null) throw new Error("Cannot access Worm. Worm is null.");
  worm.completions += reward;
}

export function getWormSession(identifier: number) {
  const session = currentWormSessions.get(identifier);
  if (session !== undefined) return session;
  return null;
}

export function createNewWormSession() {
  if (worm === null) throw new Error("Cannot access Worm. Worm is null.");
  const newSession = new WormSession(worm);

  currentWormSessions.set(newSession.identifier, newSession);
  WormSessionEvents.emit();

  return newSession;
}

export function pushToFinishedSessions(session: WormSession, isUISession: boolean) {
  if (isUISession) {
    finishedWormUISessions.push(session);
  } else {
    finishedWormSessions.push(session);
  }
  if (finishedWormSessions.length > Settings.MaxRecentScriptsCapacity) {
    finishedWormSessions.splice(0, finishedWormSessions.length - Settings.MaxRecentScriptsCapacity);
  }
  if (finishedWormUISessions.length > Settings.MaxRecentScriptsCapacity) {
    finishedWormUISessions.splice(0, finishedWormUISessions.length - Settings.MaxRecentScriptsCapacity);
  }

  WormSessionEvents.emit();
}
