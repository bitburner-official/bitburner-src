import { Worm as IWorm } from "@nsdefs";
import { NetscriptContext, InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { canAccessWorm, worm, Worm } from "../Worm/Worm";
import { bonuses } from "../Worm/BonusType";
import { wormTestingTime, wormMaxSessions, wormContractEffect } from "../Worm/calculations";
import {
  applyWormSessionReward,
  createNewWormSession,
  currentWormSessions,
  finishedWormSessions,
  getWormSession,
  isWormOnCreateCooldown,
  isWormOnSolveCooldown,
  pushToFinishedSessions,
  WormSession,
} from "../Worm/WormSession";
import { Player } from "@player";

export function NetscriptWorm(): InternalAPI<IWorm> {
  function checkWormAPIAccess(ctx: NetscriptContext): void {
    if (!canAccessWorm()) {
      throw helpers.errorMessage(ctx, "You have no access to the Worm API", "API ACCESS");
    }
  }

  function getWorm(): Worm {
    if (worm === null) throw new Error("Cannot get worm. worm is null");
    return worm;
  }

  function getSession(ctx: NetscriptContext, identifier: number): WormSession {
    const session = getWormSession(identifier);
    if (session === null) throw helpers.errorMessage(ctx, `Cannot find Worm Session with identifier '${identifier}'.`);
    return session;
  }

  return {
    setBonus: (ctx) => (_bonus) => {
      checkWormAPIAccess(ctx);
      const bonus = helpers.number(ctx, "bonus", _bonus);
      const value = bonuses.find((b) => b.id === bonus);
      if (value === undefined)
        throw new Error(
          `Value "${bonus}" is not a valid bonus. Valid: ${bonuses.map((d) => d.id.toString()).join(", ")}`,
        );
      getWorm().bonus = value;
      helpers.log(ctx, () => `Set Worm bonus to ${value.name}`);
    },
    getContractInfluence: (ctx) => () => {
      checkWormAPIAccess(ctx);
      return wormContractEffect(Player.numContractsSolved);
    },
    getCompletions: (ctx) => () => {
      checkWormAPIAccess(ctx);
      return getWorm().completions;
    },
    getUnsolvedSessions: (ctx) => () => {
      checkWormAPIAccess(ctx);
      const currentSessions = Array.from(currentWormSessions.values());
      return currentSessions.map((s) => s.identifier);
    },
    createNewSession: (ctx) => () => {
      checkWormAPIAccess(ctx);
      if (isWormOnCreateCooldown()) return null;
      if (currentWormSessions.size >= wormMaxSessions(Player.sourceFileLvl(16))) return null;
      const session = createNewWormSession();
      helpers.log(ctx, () => `Created new Worm Session with identifier ${session.identifier}`);
      return session.identifier;
    },
    getSessionLimit: (ctx) => (_level) => {
      checkWormAPIAccess(ctx);
      if (_level === undefined) return wormMaxSessions(Player.sourceFileLvl(16));
      const level = helpers.number(ctx, "level", _level);
      return wormMaxSessions(level);
    },
    getFinishedSession: (ctx) => (_sessionIdentifier) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = finishedWormSessions.find((s) => s.identifier === sessionIdentifier);
      if (session === undefined)
        throw helpers.errorMessage(ctx, `Cannot find finished session with identifier ${sessionIdentifier}.`);
      return {
        identifier: session.identifier,
        reward: session.getReward(),
        testsDone: session.testsDone,
        startTime: session.startTime,
        finishTime: session.finishTime,
        params: { ...session.params },
        guess: { ...session.guess },
        graph: structuredClone(session.graph),
      };
    },
    getFinishedSessions: (ctx) => () => {
      checkWormAPIAccess(ctx);
      return [...finishedWormSessions.map((s) => s.identifier)];
    },
    getSessionStates: (ctx) => (_sessionIdentifier) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      return [...session.graph.states];
    },
    getSessionSymbols: (ctx) => (_sessionIdentifier) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      return [...session.graph.symbols];
    },
    getSessionParams: (ctx) => (_sessionIdentifier) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      return { ...session.params };
    },
    getTestingTime: (ctx) => (_threads, _player) => {
      checkWormAPIAccess(ctx);
      const threads = helpers.number(ctx, "threads", _threads);
      if (_player === undefined) return wormTestingTime(threads);
      const person = helpers.person(ctx, _player);
      return wormTestingTime(threads, person);
    },
    getSessionMaxReward: (ctx) => (_sessionIdentifier) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      return session.getMaximumReward();
    },
    getSessionTestsDone: (ctx) => (_sessionIdentifier) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      return session.testsDone;
    },
    testInput: (ctx) => (_sessionIdentifier, _input) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const input = helpers.string(ctx, "input", _input);
      helpers.log(ctx, () => `Testing input "${input}" on Worm Session with identifier ${sessionIdentifier}`);
      return helpers.netscriptDelay(ctx, wormTestingTime(ctx.workerScript.scriptRef.threads)).then(() => {
        const finalState = session.evaluate(input, true);
        helpers.log(
          ctx,
          () => `Testing input "${input}" on Worm Session with identifier ${sessionIdentifier} returned ${finalState}`,
        );
        return Promise.resolve(finalState);
      });
    },
    attemptSolve: (ctx) => (_sessionIdentifier) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      if (isWormOnSolveCooldown()) return null;
      const reward = session.solve();
      helpers.log(ctx, () => `Attempted to solve Worm Session with identifier ${sessionIdentifier}`);

      applyWormSessionReward(reward);
      currentWormSessions.delete(session.identifier);
      pushToFinishedSessions(session, false);

      return reward;
    },
    setDepthFirstSearchState: (ctx) => (_sessionIdentifier, _state) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const state = helpers.string(ctx, "state", _state);
      session.guess.dfsState = state;
    },
    setIsBipartite: (ctx) => (_sessionIdentifier, _bipartite) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const bipartite = helpers.boolean(ctx, "bipartite", _bipartite);
      session.guess.bipartite = bipartite;
    },
    setNodeIndegree: (ctx) => (_sessionIdentifier, _indegree) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const indegree = helpers.number(ctx, "indegree", _indegree);
      session.guess.indegree = indegree;
    },
    setNodeValue: (ctx) => (_sessionIdentifier, _value) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const value = helpers.number(ctx, "value", _value);
      session.guess.value = value;
    },
    setShortestPath: (ctx) => (_sessionIdentifier, _path) => {
      const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const path = helpers.string(ctx, "path", _path);
      session.guess.path = path;
    },
  };
}
