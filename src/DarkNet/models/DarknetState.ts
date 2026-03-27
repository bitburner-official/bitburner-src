import { EventEmitter } from "../../utils/EventEmitter";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import type { DarknetServer } from "../../Server/DarknetServer";
import { MAX_NET_DEPTH, NET_WIDTH } from "../Enums";

import { getDarknetCyclesPerMutation } from "../utils/darknetNetworkUtils";
import type { PasswordResponse } from "./DarknetServerOptions";
import { assertFiniteNumber, assertNonNullish } from "../../utils/TypeAssertion";

/** Event emitter to allow the UI to subscribe to Darknet gameplay updates in order to trigger rerenders properly */
export const DarknetEvents = new EventEmitter<[]>();

export type ServerState = {
  lastLogTime?: Date;
  serverLogs: LogEntry[];
  authenticatedPIDs: number[];
};

export type LogEntry = {
  pid: number;
  message: string | PasswordResponse;
};

/**
 * If you add a new property to this global state, you must check if you need to reset it in prestigeDarknetState.
 */
export const DarknetState = {
  // If this is null, network mutation is allowed. If this is a function,
  // mutation is frozen and calling the function releases the lock.
  // *Only* the lock function may reset this to null.
  mutationLock: null as (() => void) | null,
  openServer: null as BaseServer | null,
  nextMutation: Promise.resolve(),
  nextMutationResolver: null as (() => void) | null,
  storedCycles: 0,
  hasUsedHeartbleed: false,
  cyclesSinceLastMutation: 0,

  Network: new Array(MAX_NET_DEPTH).fill(null).map(() => new Array<DarknetServer | null>(NET_WIDTH).fill(null)),

  labyrinth: null as string[] | null,
  labEndpoint: null as [number, number] | null,
  /**
   * This property may contain data of dead PIDs. Call cleanUpLabyrinthLocations before using this property if you
   * want to get data of alive PIDs.
   */
  labLocations: {} as Record<number, [number, number] | undefined>,

  lastPhishingCacheTime: new Date(),
  lastCctRewardTime: new Date(),
  lastStormTime: new Date(),

  stockPromotions: {} as Record<string, number>,
  migrationInductionServers: new Map<string, number>(),

  /**
   * Do NOT access the server state directly via this property. You must call getServerState.
   */
  serverState: new Map<string, ServerState>(),
  /**
   * Much like AllServers, this contains both hostnames and IP addresses in a single set.
   *
   * A note about memory use: On Chrome 144.0.7559.133, memory tests indicate that a
   * dense array takes ~4 bytes/entry. A Set takes ~10.24 bytes/entry. And the
   * strings we are storing inside take 14 + length bytes each. Random IPs
   * average (10+90*2+156*3)*4/256+3 = 13.28 chars, so 27.28 bytes. The
   * hostnames I don't know how to estimate, but same ballpark.
   *
   * There's two points to this:
   * 1. Most of the cost comes from the strings, so using an array won't save
   *    much compared to a Set. It's better to use a Set for fast lookups.
   * 2. The size of this Set can grow without bound over time, so it's
   *    important that servers not get deleted too aggressively. A
   *    conservative estimate is 80 bytes/server, since there are two entries.
   */
  offlineServers: new Set<string>(),
  showFullNetwork: false,
  zoomIndex: 7,
  netViewTopScroll: 0,
  netViewLeftScroll: 0,
};

export function prestigeDarknetState(prestigeSourceFile: boolean): void {
  DarknetState.mutationLock?.();
  DarknetState.openServer = null;
  DarknetState.storedCycles = 0;
  if (prestigeSourceFile) {
    DarknetState.hasUsedHeartbleed = false;
  }
  DarknetState.cyclesSinceLastMutation = 0;
  DarknetState.Network = new Array(MAX_NET_DEPTH).fill(null).map(() => new Array<null>(NET_WIDTH).fill(null));
  DarknetState.labyrinth = null;
  DarknetState.labLocations = {};
  DarknetState.lastPhishingCacheTime = new Date();
  DarknetState.lastStormTime = new Date();
  DarknetState.stockPromotions = {};
  DarknetState.migrationInductionServers.clear();
  DarknetState.serverState.clear();
  DarknetState.offlineServers.clear();
}

/**
 * Get the server state. It will initialize the state if it does not exist in DarknetState.serverState.
 */
export const getServerState = (hostname: string): ServerState => {
  const currentState = DarknetState.serverState.get(hostname);
  if (currentState) {
    return currentState;
  }
  const newState = {
    serverLogs: [],
    lastLogTime: undefined,
    authenticatedPIDs: [],
  };
  DarknetState.serverState.set(hostname, newState);
  return newState;
};

/**
 * Clean data of dead PIDs in DarknetState.labLocations.
 */
export const cleanUpLabyrinthLocations = (): void => {
  for (const [pidAsString, location] of Object.entries(DarknetState.labLocations)) {
    const pid = Number(pidAsString);
    assertFiniteNumber(pid);
    assertNonNullish(location);
    // PID -1 is the manual mode.
    if (pid === -1) {
      continue;
    }
    if (!findRunningScriptByPid(pid)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete DarknetState.labLocations[pid];
    }
  }
};

export const addSessionToServer = (server: DarknetServer, pid: number) => {
  const serverState = getServerState(server.hostname);
  removeExpiredSessions(server);
  if (serverState.authenticatedPIDs.includes(pid)) return;
  serverState.authenticatedPIDs.push(pid);
};

const removeExpiredSessions = (server: DarknetServer) => {
  const serverState = getServerState(server.hostname);
  serverState.authenticatedPIDs = serverState.authenticatedPIDs.filter((pid) => findRunningScriptByPid(pid));
};

export const storeDarknetCycles = (cycles: number) => {
  if (DarknetState.storedCycles < 0) {
    DarknetState.storedCycles = 0;
  }
  if (DarknetState.cyclesSinceLastMutation < 0) {
    DarknetState.cyclesSinceLastMutation = 0;
  }

  DarknetState.storedCycles += cycles;
  DarknetState.cyclesSinceLastMutation += cycles;
};

export const hasDarknetBonusTime = () => DarknetState.storedCycles > getDarknetCyclesPerMutation() * 2;

export const triggerNextUpdate = () => {
  DarknetState.nextMutationResolver?.();
  DarknetState.nextMutation = new Promise((resolve) => {
    DarknetState.nextMutationResolver = resolve;
  });
};

// Set up initial promises
triggerNextUpdate();
