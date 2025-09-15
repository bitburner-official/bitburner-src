import { EventEmitter } from "../../utils/EventEmitter";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { DarknetServer } from "../../Server/DarknetServer";
import { isDarknetServer } from "../effects/effects";
import { MAX_NET_DEPTH, NET_WIDTH } from "../Enums";
import { getDarknetCyclesPerMutation } from "../controllers/NetworkMovement";

/** Event emitter to allow the UI to subscribe to Darknet gameplay updates in order to trigger rerenders properly */
export const DarknetEvents = new EventEmitter();

export type DarknetState = {
  isMutating: boolean;
  openServer: BaseServer | null;
  Network: (DarknetServer | null)[][];
  labyrinth: string[] | null;
  labLocations: Record<number, [number, number]>;
  lastPhishingCacheTime: Date;
  lastStormTime: Date;
  stockPromotions: Record<string, number>;
  migrationInductionServers: Record<string, number>;
  webstormTokens: number;
  serverState: Record<string, serverState>;
  offlineServers: string[];
  storedCycles: number;
  cyclesSinceLastMutation: number;
  showFullNetwork: boolean;
};

export type serverState = {
  lastLogTime?: Date;
  serverLogs: string[];
  authenticatedPIDs: number[];
};

export const DarknetState: DarknetState = {
  isMutating: true,
  openServer: null,

  Network: new Array(MAX_NET_DEPTH).fill(null).map(() => new Array(NET_WIDTH).fill(null) as (DarknetServer | null)[]),

  labyrinth: null,
  labLocations: { "-1": [1, 1] },
  lastPhishingCacheTime: new Date(),
  lastStormTime: new Date(),
  stockPromotions: {},
  migrationInductionServers: {},
  webstormTokens: 0,
  serverState: {},
  offlineServers: [],
  storedCycles: 0,
  cyclesSinceLastMutation: 0,
  showFullNetwork: false,
};

export const getServerState = (hostname: string): serverState => {
  if (!DarknetState.serverState[hostname]) {
    DarknetState.serverState[hostname] = {
      serverLogs: [],
      lastLogTime: undefined,
      authenticatedPIDs: [],
    };
  }
  return DarknetState.serverState[hostname];
};

export const addSessionToServer = (server: BaseServer, pid: number) => {
  if (!isDarknetServer(server)) return;
  const serverState = getServerState(server.hostname);
  removeExpiredSessions(server);
  if (serverState.authenticatedPIDs.includes(pid)) return;
  serverState.authenticatedPIDs.push(pid);
};

const removeExpiredSessions = (server: BaseServer) => {
  if (!isDarknetServer(server)) return;
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
