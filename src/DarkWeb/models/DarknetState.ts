import { EventEmitter } from "../../utils/EventEmitter";
import { Server } from "../../Server/Server";
import { BaseServer } from "../../Server/BaseServer";
import { mutateDarknet } from "../controllers/DarknetNetworkMovement";
import { generateMaze } from "./labyrinth";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";

export const NET_WIDTH = 8;
export const NET_DEPTH = 23;
export const SERVER_DENSITY = 0.65;

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const DarknetEvents = new EventEmitter();

export type DarknetState = {
  isMutating: boolean;
  openServer: BaseServer | null;
  Network: (BaseServer | null)[][];
  labyrinth: string[][];
  labLocations: Record<number, [number, number]>;
  lastPhishingCacheTime: Date;
  lastStormTime: Date;
  stockPromotions: Record<string, number>;
  migrationInductionServers: Record<string, number>;
  webstormTokens: number;
  serverState: Record<string, serverState>;
};

export type serverState = {
  lastLogTime?: Date;
  serverLogs: string[];
  authenticatedPIDs: number[];
};

export const DarknetState: DarknetState = {
  isMutating: true,
  openServer: null,

  Network: new Array(NET_DEPTH).fill(null).map(() => new Array(NET_WIDTH).fill(null) as (Server | null)[]),

  labyrinth: generateMaze(),
  labLocations: { "-1": [1, 1] },
  lastPhishingCacheTime: new Date(),
  lastStormTime: new Date(),
  stockPromotions: {},
  migrationInductionServers: {},
  webstormTokens: 0,
  serverState: {},
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
  if (!server?.darknetData) return;
  const serverState = getServerState(server.hostname);
  removeExpiredSessions(server);
  if (serverState.authenticatedPIDs.includes(pid)) return;
  serverState.authenticatedPIDs.push(pid);
};

const removeExpiredSessions = (server: BaseServer) => {
  if (!server?.darknetData) return;
  const serverState = getServerState(server.hostname);
  serverState.authenticatedPIDs = serverState.authenticatedPIDs.filter((pid) => findRunningScriptByPid(pid));
};
