import { EventEmitter } from "../../utils/EventEmitter";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import type { DarknetServer } from "../../Server/DarknetServer";
import { MAX_NET_DEPTH, NET_WIDTH } from "../Enums";

import { getDarknetCyclesPerMutation } from "../utils/darknetNetworkUtils";
import type { PasswordResponse } from "./DarknetServerOptions";
import { assertFiniteNumber, assertNonNullish } from "../../utils/TypeAssertion";

/** Event emitter to allow the UI to subscribe to Darknet gameplay updates in order to trigger rerenders properly */
export const DarknetEvents = new EventEmitter();

export type ServerState = {
  lastLogTime?: Date;
  serverLogs: LogEntry[];
  authenticatedPIDs: number[];
};

export type LogEntry = {
  pid: number;
  message: string | PasswordResponse;
};

export const DarknetState = {
  allowMutating: true,
  openServer: null as BaseServer | null,
  nextMutation: Promise.resolve(),
  nextMutationResolver: null as (() => void) | null,
  storedCycles: 0,
  hasUsedHeartbleed: false,
  cyclesSinceLastMutation: 0,

  Network: new Array(MAX_NET_DEPTH).fill(null).map(() => new Array<DarknetServer | null>(NET_WIDTH).fill(null)),

  labyrinth: null as string[] | null,
  /**
   * This property may contain data of dead PIDs. Call cleanUpLabyrinthLocations before using this property if you
   * want to get data of alive PIDs.
   */
  labLocations: { "-1": [1, 1] } as Record<number, [number, number] | undefined>,

  lastPhishingCacheTime: new Date(),
  lastStormTime: new Date(),

  stockPromotions: {} as Record<string, number>,
  migrationInductionServers: {} as Record<string, number>,

  /**
   * Do NOT access the server state directly via this property. You must call getServerState.
   */
  serverState: {} as Record<string, ServerState>,
  offlineServers: [] as string[],
  showFullNetwork: false,
  zoomIndex: 7,
  netViewTopScroll: 0,
  netViewLeftScroll: 0,
};

/**
 * Get the server state. It will initialize the state if it does not exist in DarknetState.serverState.
 */
export const getServerState = (hostname: string): ServerState => {
  if (!DarknetState.serverState[hostname]) {
    DarknetState.serverState[hostname] = {
      serverLogs: [],
      lastLogTime: undefined,
      authenticatedPIDs: [],
    };
  }
  return DarknetState.serverState[hostname];
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
