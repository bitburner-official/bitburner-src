import { connectServers, DeleteServer, disconnectServers, GetAllServers, GetServer } from "../../Server/AllServers";
import {
  DarknetEvents,
  DarknetState,
  getServerState,
  NET_DEPTH,
  NET_WIDTH,
  SERVER_DENSITY,
} from "../models/DarknetState";
import { getDarknetServer } from "./DarknetServerGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";
import { addServerToNetwork, AIR_GAP_DEPTH, movePlayerIfNeeded } from "./DarknetNetworkGenerator";
import { stopAndCleanUpWorkerScript } from "../../Netscript/killWorkerScript";
import { workerScripts } from "../../Netscript/WorkerScripts";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { WorkerScript } from "../../Netscript/WorkerScript";

export const mutateDarknet = () => {
  if (!DarknetState.isMutating) {
    return;
  }
  const servers = getDarknetServers();
  if (servers.length === 0) {
    return;
  }

  if (Math.random() < 0.1) {
    const islands = getIslands();
    const island = islands[Math.floor(Math.random() * islands.length)];
    island && addGuaranteedConnection(island);
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

  if (Math.random() < 0.15) {
    induceServerMigration();
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
    const servers = getDarknetServers().filter((server) => server.hostname !== SpecialServers.Labyrinth);
    const serverToDelete = servers[Math.floor(Math.random() * servers.length)];
    deleteServer(serverToDelete);
  }
  sanitizeDarkwebNetwork();
};

export const deleteServer = (server: BaseServer, force = false) => {
  if (isImmutable(server) && !force) {
    return false;
  }
  movePlayerIfNeeded(server);
  killScripts(server);
  disconnectServer(server, true);
  if (server.darknetData && DarknetState.Network[server.darknetData.x]?.[server.darknetData.y]) {
    DarknetState.Network[server.darknetData.x][server.darknetData.y] = null;
  }
  DeleteServer(server.hostname);
};

export const addRandomServers = (count = 1, difficulty?: number) => {
  for (let i = 0; i < count; i++) {
    const diff = difficulty ?? Math.floor(Math.random() * NET_DEPTH);
    const newServer = getDarknetServer(diff, -1, -1);
    const success = moveServer(newServer);
    if (!success) {
      deleteServer(newServer);
    }
  }
  sanitizeDarkwebNetwork();
};

export const balanceServers = () => {
  if (getDarknetServers().length > NET_DEPTH * NET_WIDTH * SERVER_DENSITY) {
    const serversToRemove = getDarknetServers().length - NET_DEPTH * NET_WIDTH * SERVER_DENSITY;
    deleteRandomServers(serversToRemove);
  } else {
    const serversToAdd = NET_DEPTH * NET_WIDTH * SERVER_DENSITY - getDarknetServers().length;
    addRandomServers(serversToAdd);
  }
};

export const moveServer = (server: BaseServer, range = 3) => {
  const darknetData = server.darknetData;
  if (!darknetData) {
    throw new Error("Server missing dark web data");
  }
  // Do not try to move the server that is open in the UI or the terminal
  if (isImmutable(server)) {
    return false;
  }

  for (let i = 0; i < 30; i++) {
    // Limit depth movement to +-3 spaces
    let newX = Math.min(
      Math.max(Math.floor(Math.random() * (2 * range) + darknetData.difficulty - range), 0),
      NET_DEPTH - 1,
    );
    // simple "air gaps" in the network
    if (isOnAirGap(newX)) {
      newX += Math.random() < 0.5 ? -1 : 1;
    }

    const newY = Math.floor(Math.random() * NET_WIDTH);
    if (DarknetState.Network[newX][newY] !== null) {
      continue;
    }

    disconnectServer(server, true);

    if (DarknetState.Network[darknetData.x]?.[darknetData.y]) {
      DarknetState.Network[darknetData.x][darknetData.y] = null;
    }
    addServerToNetwork(server, newX, newY, true);
    return true;
  }
  return false;
};

export const killScripts = (server: BaseServer) => {
  for (const byPid of server.runningScriptMap.values()) {
    for (const runningScript of byPid.values()) {
      killWorkerScriptWithMessage(runningScript.pid, "Server shut down.");
    }
  }
};

export function killWorkerScriptWithMessage(pid: number, message: string): boolean {
  const ws = workerScripts.get(pid);
  if (ws instanceof WorkerScript) {
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
    const isOkToDisconnect = disconnectDarkweb || connectedServer?.hostname === SpecialServers.DarkWeb;
    if (connectedServer && isOkToDisconnect && !isImmutable(connectedServer)) {
      disconnectServers(server, connectedServer as Server);
    }
  });
};

export const restartServer = (server: BaseServer) => {
  if (!server?.darknetData || isImmutable(server)) {
    return false;
  }
  const runningScripts = server.runningScriptMap;

  for (const scripts of runningScripts.values()) {
    for (const scriptInstance of scripts.values()) {
      const ws = workerScripts.get(scriptInstance.pid);
      if (ws) {
        ws.log("", () => `Script killed by server restart`);
        stopAndCleanUpWorkerScript(ws);
        return true;
      }
    }
  }
  const serverState = getServerState(server.hostname);
  serverState.authenticatedPIDs = [];
  server.backdoorInstalled = false;
  disconnectServer(server);
  addGuaranteedConnection(server);
  addGuaranteedConnection(server);
};

export const addGuaranteedConnection = (server: BaseServer) => {
  const darknetData = server.darknetData;
  if (!darknetData || server.hostname === SpecialServers.Labyrinth) {
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
  const leftNeighbor = DarknetState.Network[x][y - 1];
  const rightNeighbor = DarknetState.Network[x][y + 1];
  if (leftNeighbor) {
    neighbors.push(leftNeighbor);
  }
  if (rightNeighbor) {
    neighbors.push(rightNeighbor);
  }
  return neighbors;
};

const induceServerMigration = () => {
  const highestChargedServer = Object.keys(DarknetState.migrationInductionServers).reduce(
    (highestServer: string, currentServer: string) => {
      const currentServerCharge = DarknetState.migrationInductionServers[currentServer] ?? 0;
      const highestServerCharge = DarknetState.migrationInductionServers[highestServer] ?? 0;
      if (currentServerCharge > highestServerCharge) {
        return currentServer;
      }
      return highestServer;
    },
    "",
  );
  if (!highestChargedServer) {
    return;
  }

  const charges = DarknetState.migrationInductionServers[highestChargedServer] ?? 0;
  const inductionChance = 0.7 * (1 - Math.exp(-0.01 * charges));
  if (Math.random() < inductionChance) {
    DarknetState.migrationInductionServers[highestChargedServer] = 0;
    const server = getServerSafely(highestChargedServer);
    if (!server) {
      return;
    }
    const neighbors = server.serversOnNetwork.filter((s) => s !== SpecialServers.DarkWeb);
    const neighborToMove = neighbors[Math.floor(Math.random() * neighbors.length)];
    const serverToMove = getServerSafely(neighborToMove);
    if (serverToMove) {
      moveServer(serverToMove, 4);
    }
  }
};

export const getServersOnRowBelow = (x: number, close = false): BaseServer[] => {
  const rowBelow = DarknetState.Network[x - 1]?.filter(notNull<BaseServer>) ?? [];
  if (close) {
    return rowBelow.filter((server) => Math.abs(server.darknetData?.y ?? 0 - x) <= 1);
  }
  return rowBelow;
};

export const getServersOnRowAbove = (x: number, close = false): BaseServer[] => {
  const rowAbove = DarknetState.Network[x + 1]?.filter(notNull<BaseServer>) ?? [];
  if (close) {
    return rowAbove.filter((server) => Math.abs(server.darknetData?.y ?? 0 - x) <= 1);
  }
  return rowAbove;
};

export const getDarknetServers = (): BaseServer[] => {
  return DarknetState.Network.flat().filter(notNull<BaseServer>);
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
    if (!GetServer(server.hostname)) {
      DarknetState.Network[server.darknetData?.x ?? 0][server.darknetData?.y ?? 0] = null;
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

    if (server.darknetData?.x === 0 && darkweb) {
      connectServers(server, darkweb);
    }
  }
  DarknetEvents.emit();
};

export const getBackdooredDarkwebServers = (): BaseServer[] =>
  GetAllServers(true).filter((s) => s && s.darknetData && !s.darknetData.hasStasisLink && s.backdoorInstalled);

const isOnAirGap = (x: number): boolean => !!x && !(x % AIR_GAP_DEPTH);

const notNull = <T>(value: T | null): value is T => value !== null;

const isImmutable = (server?: BaseServer | null) =>
  !server?.darknetData ||
  server === DarknetState.openServer ||
  server.isConnectedTo ||
  server.darknetData.hasStasisLink;

const getIslands = () => GetAllServers(true).filter((s) => s && s.darknetData && !s.serversOnNetwork.length);

export const getServerSafely = (hostname: string): BaseServer | undefined =>
  GetAllServers(true).find((s) => s.hostname === hostname);
