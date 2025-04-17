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
  stockPromotions: Record<string, number>;
};

export const DarknetState: DarknetState = {
  isMutating: true,
  openServer: null,

  Network: new Array(NET_DEPTH).fill(null).map(() => new Array(NET_WIDTH).fill(null) as (Server | null)[]),

  labyrinth: generateMaze(),
  labLocations: { "-1": [1, 1] },
  lastPhishingCacheTime: new Date(),
  stockPromotions: {},
};

export const startDarknetMovement = () => setInterval(() => mutateDarknet(), 4000);

export const addSessionToServer = (server: BaseServer, pid: number) => {
  if (!server?.darknetData) return;
  removeExpiredSessions(server);
  if (server.darknetData.authenticatedPIDs.includes(pid)) return;
  server.darknetData.authenticatedPIDs.push(pid);
};

const removeExpiredSessions = (server: BaseServer) => {
  if (!server?.darknetData) return;
  server.darknetData.authenticatedPIDs = server.darknetData.authenticatedPIDs.filter((pid) =>
    findRunningScriptByPid(pid),
  );
};
