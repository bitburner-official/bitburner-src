import { EventEmitter } from "../../utils/EventEmitter";
import { BaseServer } from "../../Server/BaseServer";
import { mutateDarknet } from "../controllers/DarknetNetworkMovement";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { DarknetServer } from "../../Server/DarknetServer";
import { isDarknetServer } from "./effects";

export const NET_WIDTH = 8;
export const MAX_NET_DEPTH = 40;
export const SERVER_DENSITY = 0.65;

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
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
};

export const startDarknetMovement = () => setInterval(() => mutateDarknet(), 4000);

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
