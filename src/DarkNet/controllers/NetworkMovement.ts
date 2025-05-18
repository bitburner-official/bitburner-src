import { connectServers, DeleteServer, disconnectServers, GetAllServers, GetServer } from "../../Server/AllServers";
import {
  DarknetEvents,
  DarknetState,
  getServerState,
  MS_PER_MUTATION_PER_ROW,
  NET_WIDTH,
  SERVER_DENSITY,
} from "../models/DarknetState";
import { getDarknetServer } from "./ServerGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";
import { addServerToNetwork, AIR_GAP_DEPTH, movePlayerIfNeeded } from "./NetworkGenerator";
import { stopAndCleanUpWorkerScript } from "../../Netscript/killWorkerScript";
import { workerScripts } from "../../Netscript/WorkerScripts";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { getNetDepth, isLabyrinthServer } from "../effects/labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";
import { getDarknetData, isDarknetServer } from "../effects/effects";
import { CONSTANTS } from "../../Constants";

export const processDarknet = () => {
  if (DarknetState.storedCycles < 0) {
    DarknetState.storedCycles = 0;
  }
  const depth = getNetDepth();
  const cycleRate = MS_PER_MUTATION_PER_ROW / CONSTANTS.MilliPerCycle;
  const cyclesPerUpdate = cycleRate / depth;
  if (DarknetState.storedCycles > cyclesPerUpdate) {
    DarknetState.storedCycles -= cyclesPerUpdate;
    DarknetState.bonusCycles = Math.max(DarknetState.bonusCycles - cyclesPerUpdate, 0);
    mutateDarknet();
  }
};

export const mutateDarknet = () => {
  if (!DarknetState.isMutating) {
    return;
  }
  const servers = getDarknetServers();
  if (servers.length === 0) {
    return;
  }

  // Limit mutation speed based on size of net
  const depth = getNetDepth();
  const depthSpeedFactor = 12 / depth;
  if (Math.random() > depthSpeedFactor) {
    return;
  }

  if (Math.random() < 0.3) {
    const islands = getIslands();
    const island = islands[Math.floor(Math.random() * islands.length)];
    island && moveServer(island);
  }

  if (Math.random() < 0.1) {
    // remove some servers
    deleteRandomServers(Math.random() * 3 + 1);
  }

  if (Math.random() < 0.1) {
    // Add some servers
    const serversToAdd = Math.random() * 3 + 1;
    for (let i = 0; i < serversToAdd; i++) {
      addRandomServers();
    }
    return;
  }

  if (Math.random() < 0.1) {
    const backdooredServers = getBackdooredDarkwebServers();
    const server = backdooredServers[Math.floor(Math.random() * backdooredServers.length)];
    if (server) {
      restartServer(server);
      return;
    }
  }

  if (Math.random() < 0.05) {
    const backdooredServers = getBackdooredDarkwebServers();
    const server = backdooredServers[Math.floor(Math.random() * backdooredServers.length)];
    if (server) {
      deleteServer(server);
      return;
    }
  }

  if (Math.random() < 0.2) {
    // restart a server
    const server = servers[Math.floor(Math.random() * servers.length)];
    restartServer(server);
  }

  if (Math.random() < 0.5) {
    moveRandomServers(3);
  }

  if (Math.random() < 0.5) {
    // add a couple connections
    const server2 = servers[Math.floor(Math.random() * servers.length)];
    addGuaranteedConnection(server2);
    addGuaranteedConnection(server2);
    return;
  }

  if (Math.random() < 0.5) {
    // delink all connections from a server
    const server3 = servers[Math.floor(Math.random() * servers.length)];
    disconnectServer(server3);
  }

  if (Math.random() < 0.1) {
    // balance network to stay at a certain density
    balanceServers();
  }
  sanitizeDarkwebNetwork();
};

export const restartAllServers = () => {
  const servers = getDarknetServers();
  for (const server of servers) {
    restartServer(server);
  }
};

export const moveRandomServers = (count = 1) => {
  const servers = getDarknetServers();
  for (let i = 0; i < count; i++) {
    const server = servers[Math.floor(Math.random() * servers.length)];
    moveServer(server);
  }
};

export const deleteRandomServers = (count = 1) => {
  for (let i = 0; i < count; i++) {
    const servers = getDarknetServers().filter((server) => !isLabyrinthServer(server.hostname));
    const serverToDelete = servers[Math.floor(Math.random() * servers.length)];
    deleteServer(serverToDelete);
  }
  sanitizeDarkwebNetwork();
};

export const deleteServer = (server: BaseServer, force = false) => {
  if (!server || (isImmutable(server) && !force)) {
    return false;
  }
  movePlayerIfNeeded(server);
  killScripts(server);
  disconnectServer(server, true);
  if (isDarknetServer(server) && DarknetState.Network[server.darknetData.x]?.[server.darknetData.y]) {
    DarknetState.Network[server.darknetData.x][server.darknetData.y] = null;
  }
  DarknetState.offlineServers.push(server.hostname);
  DeleteServer(server.hostname);
};

export const addRandomServers = (count = 1, difficulty?: number) => {
  for (let i = 0; i < count; i++) {
    const diff = difficulty ?? Math.floor(Math.random() * getNetDepth());
    const newServer = getDarknetServer(diff, -1, -1);
    const success = moveServer(newServer);
    if (!success) {
      deleteServer(newServer);
    }
    if (DarknetState.offlineServers.includes(newServer.hostname)) {
      DarknetState.offlineServers = DarknetState.offlineServers.filter((s) => s !== newServer.hostname);
    }
  }
  sanitizeDarkwebNetwork();
};

export const balanceServers = () => {
  if (getDarknetServers().length > getNetDepth() * NET_WIDTH * SERVER_DENSITY) {
    const serversToRemove = getDarknetServers().length - getNetDepth() * NET_WIDTH * SERVER_DENSITY;
    deleteRandomServers(serversToRemove);
  } else {
    const serversToAdd = getNetDepth() * NET_WIDTH * SERVER_DENSITY - getDarknetServers().length;
    addRandomServers(serversToAdd);
  }
};

export const moveServer = (server: BaseServer, maxDepthDecrease = 3, maxDepthIncrease = 3) => {
  const darknetData = getDarknetData(server);
  if (!server || !darknetData || isImmutable(server)) {
    // Do not try to move the server that is open in the UI or the terminal
    return false;
  }

  const positionOptions = getAllOpenPositions(
    darknetData.difficulty - maxDepthDecrease,
    darknetData.difficulty + maxDepthIncrease,
  );
  if (positionOptions.length === 0) {
    return false;
  }

  const [newX, newY] = positionOptions[Math.floor(Math.random() * positionOptions.length)];
  disconnectServer(server, true);

  if (DarknetState.Network[darknetData.x]?.[darknetData.y]) {
    DarknetState.Network[darknetData.x][darknetData.y] = null;
  }
  addServerToNetwork(server, newX, newY);
  return true;
};

const getAllOpenPositions = (minDepth: number, maxDepth: number): [number, number][] => {
  const min = Math.max(0, minDepth);
  const max = Math.min(maxDepth, getNetDepth() - 1);
  const positions: [number, number][] = [];
  for (let x = min; x <= max; x++) {
    for (let y = 0; y < NET_WIDTH; y++) {
      if (DarknetState.Network[x] && !DarknetState.Network[x][y] && !isOnAirGap(x)) {
        positions.push([x, y]);
      }
    }
  }
  if (min === 0 && max === getNetDepth() - 1) {
    return positions;
  }
  if (positions.length === 0) {
    return getAllOpenPositions(min - 1, max + 1);
  }
  return positions;
};

export const killScripts = (server: BaseServer) => {
  if (!server) {
    return;
  }
  const scripts = server.runningScriptMap.values();
  for (const byPid of scripts) {
    for (const runningScript of byPid.values()) {
      killWorkerScriptWithMessage(runningScript.pid, "Server shut down.");
    }
  }
};

export function killWorkerScriptWithMessage(pid: number, message: string): boolean {
  const ws = workerScripts.get(pid);
  if (ws) {
    ws.log("", () => message ?? "Script killed.");
    stopAndCleanUpWorkerScript(ws);
    return true;
  }
  return false;
}

export const disconnectServer = (server: BaseServer, disconnectDarkweb = false) => {
  if (isImmutable(server)) {
    return false;
  }
  server.serversOnNetwork.forEach((conn) => {
    const connectedServer = GetServer(conn);
    const isOkToDisconnect = disconnectDarkweb || connectedServer?.hostname !== SpecialServers.DarkWeb;
    if (connectedServer && isOkToDisconnect) {
      disconnectServers(server, connectedServer as Server);
    }
  });
};

export const restartServer = (server: BaseServer) => {
  if (!isDarknetServer(server) || isImmutable(server)) {
    return false;
  }
  killScripts(server);
  const serverState = getServerState(server.hostname);
  serverState.authenticatedPIDs = [];
  server.backdoorInstalled = false;
  disconnectServer(server);
  addGuaranteedConnection(server);
  addGuaranteedConnection(server);
};

export const addGuaranteedConnection = (server: BaseServer) => {
  const darknetData = getDarknetData(server);
  if (!darknetData || isLabyrinthServer(server.hostname)) {
    return;
  }

  const neighbors = getAllAdjacentNeighbors(darknetData.x ?? 0, darknetData.y ?? 0);
  if (neighbors.length === 0) {
    return;
  }
  const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
  connectServers(server, neighbor);
};

export const getNeighborsOnRow = (x: number, y: number): BaseServer[] => {
  const neighbors: BaseServer[] = [];
  const leftNeighbor = DarknetState.Network[x]?.[y - 1];
  const rightNeighbor = DarknetState.Network[x]?.[y + 1];
  if (leftNeighbor) {
    neighbors.push(leftNeighbor);
  }
  if (rightNeighbor) {
    neighbors.push(rightNeighbor);
  }
  return neighbors;
};

export const getServersOnRowBelow = (x: number, close = false): DarknetServer[] => {
  const rowBelow = DarknetState.Network[x - 1]?.filter(notNull<DarknetServer>) ?? [];
  if (close) {
    return rowBelow.filter((server) => Math.abs(server.darknetData?.y ?? 0 - x) <= 1);
  }
  return rowBelow;
};

export const getServersOnRowAbove = (x: number, close = false): DarknetServer[] => {
  const rowAbove = DarknetState.Network[x + 1]?.filter(notNull<DarknetServer>) ?? [];
  if (close) {
    return rowAbove.filter((server) => Math.abs(server.darknetData?.y ?? 0 - x) <= 1);
  }
  return rowAbove;
};

export const getDarknetServers = (): DarknetServer[] => {
  return GetAllServers(true)
    .filter(isDarknetServer)
    .filter((s) => !isLabyrinthServer(s.hostname));
};

export const getAllAdjacentNeighbors = (x: number, y: number): BaseServer[] => {
  const rowAbove = getServersOnRowAbove(x, true);
  const rowBelow = getServersOnRowBelow(x, true);
  const neighborsOnRow = getNeighborsOnRow(x, y);
  return [...rowAbove, ...rowBelow, ...neighborsOnRow];
};

export const sanitizeDarkwebNetwork = () => {
  const darkweb = GetServer(SpecialServers.DarkWeb);
  if (!darkweb) {
    return;
  }
  const servers = [...getDarknetServers(), darkweb];
  for (const server of servers) {
    const darknetData = getDarknetData(server);
    if (!GetServer(server.hostname) && DarknetState.Network[darknetData?.x ?? -1]) {
      DarknetState.Network[darknetData?.x ?? 0][darknetData?.y ?? 0] = null;
      disconnectServer(server, true);
      deleteServer(server);
      continue;
    }

    for (const conn of server.serversOnNetwork) {
      const connection = GetServer(conn);
      if (!connection) {
        server.serversOnNetwork = server.serversOnNetwork.filter((c) => c !== conn);
        continue;
      }
      if (!connection.serversOnNetwork.includes(server.hostname)) {
        server.serversOnNetwork = server.serversOnNetwork.filter((c) => c !== connection.hostname);
      }
    }

    if (darknetData?.x === 0 && darkweb) {
      connectServers(server, darkweb);
    }
  }
  DarknetEvents.emit();
};

export const getBackdooredDarkwebServers = (): BaseServer[] =>
  GetAllServers(true).filter((s) => s && isDarknetServer(s) && !s.darknetData.hasStasisLink && s.backdoorInstalled);

const isOnAirGap = (x: number): boolean => !!x && !(x % AIR_GAP_DEPTH);

const notNull = <T>(value: T | null): value is T => value !== null;

const isImmutable = (server?: BaseServer | null) =>
  !server ||
  !isDarknetServer(server) ||
  server === DarknetState.openServer ||
  server.isConnectedTo ||
  server.darknetData?.hasStasisLink;

const getIslands = () => GetAllServers(true).filter((s) => s && isDarknetServer(s) && !s.serversOnNetwork.length);

export const getServerSafely = (hostname: string): BaseServer | undefined =>
  GetAllServers(true).find((s) => s.hostname === hostname);

export const getDarknetServerSafely = (hostname: string): DarknetServer | undefined => {
  const server = getServerSafely(hostname);
  if (!server || !isDarknetServer(server)) {
    return undefined;
  }
  return server;
};
