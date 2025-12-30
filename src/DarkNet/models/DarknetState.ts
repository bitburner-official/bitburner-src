import { EventEmitter } from "../../utils/EventEmitter";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import type { DarknetServer } from "../../Server/DarknetServer";
import { MAX_NET_DEPTH, NET_WIDTH } from "../Enums";

import { getDarknetCyclesPerMutation } from "../utils/darknetNetworkUtils";
import type { PasswordResponse } from "./DarknetServerOptions";

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
  nextUpdate: Promise.resolve(),
  nextUpdateResolver: null as (() => void) | null,

  Network: new Array(MAX_NET_DEPTH).fill(null).map(() => new Array<DarknetServer | null>(NET_WIDTH).fill(null)),

  labyrinth: null as string[] | null,
  labLocations: { "-1": [1, 1] } as Record<number, [number, number] | null>,
  lastPhishingCacheTime: new Date(),
  lastStormTime: new Date(),
  stockPromotions: {} as Record<string, number>,
  migrationInductionServers: {} as Record<string, number>,
  webstormTokens: 0,
  serverState: {} as Record<string, ServerState>,
  offlineServers: [] as string[],
  storedCycles: 0,
  cyclesSinceLastMutation: 0,
  showFullNetwork: false,
};

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
  DarknetState.nextUpdateResolver?.();
  DarknetState.nextUpdate = new Promise((resolve) => {
    DarknetState.nextUpdateResolver = resolve;
  });
};

// Set up initial promises
triggerNextUpdate();
