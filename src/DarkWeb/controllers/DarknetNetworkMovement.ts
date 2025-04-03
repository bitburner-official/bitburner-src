import { connectServers, DeleteServer, disconnectServers, GetServer } from "../../Server/AllServers";
import { DarknetEvents, DarknetState, NET_DEPTH, NET_WIDTH, SERVER_DENSITY } from "../models/DarknetState";
import { getDarknetServer } from "./DarknetServerGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";
import { addServerToNetwork, AIR_GAP_DEPTH } from "./DarknetNetworkGenerator";
import {  stopAndCleanUpWorkerScript } from "../../Netscript/killWorkerScript";
import { workerScripts } from "../../Netscript/WorkerScripts";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { WorkerScript } from "../../Netscript/WorkerScript";

export const mutateDarknet = () => {
  const servers = getDarknetServers();
  if (servers.length === 0) {
    return;
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

  if (Math.random() < 0.2) {
    // restart a server
    const server = servers[Math.floor(Math.random() * servers.length)];
    restartServer(server);
  }

  if (Math.random() < 0.5) {
    // move a server
    const server1 = servers[Math.floor(Math.random() * servers.length)];
    moveServer(server1);
  }

  if (Math.random() < 0.5) {
    // add a couple connections
    const server2 = servers[Math.floor(Math.random() * servers.length)];
    addGuaranteedConnection(server2);
    addGuaranteedConnection(server2);
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
};

const deleteRandomServers = (count = 1) => {
  for (let i = 0; i < count; i++) {
    const servers = getDarknetServers();
    const serverToDelete = servers[Math.floor(Math.random() * servers.length)];
    const server = GetServer(serverToDelete.hostname);
    if (!server || server === DarknetState.openServer || server.isConnectedTo) {
      return false;
    }
    killScripts(serverToDelete);
    disconnectServer(serverToDelete, true);
    DeleteServer(serverToDelete.hostname);
  }
  sanitizeDarkwebNetwork();
};

export const addRandomServers = (count = 1) => {
  for (let i = 0; i < count; i++) {
    const difficulty = Math.floor(Math.random() * NET_DEPTH);
    const newServer = getDarknetServer(difficulty, -1, -1);
    const success = moveServer(newServer);
    if (!success) {
      DeleteServer(newServer.hostname);
    }
  }
};

export const balanceServers = () => {
  if (getDarknetServers().length > NET_DEPTH * NET_WIDTH * SERVER_DENSITY) {
    const serversToRemove = getDarknetServers().length - NET_DEPTH * NET_WIDTH * SERVER_DENSITY;
    deleteRandomServers(serversToRemove);
  } else {
    const serversToAdd = NET_DEPTH * NET_WIDTH * SERVER_DENSITY - getDarknetServers().length;
    addRandomServers(serversToAdd);
  }
  sanitizeDarkwebNetwork();
};

export const moveServer = (server: BaseServer) => {
  const darknetData = server.darknetData;
  if (!darknetData) {
    throw new Error("Server missing dark web data");
  }
  // Do not try to move the server that is open in the UI or the terminal
  if (server === DarknetState.openServer || server.isConnectedTo) {
    return false;
  }

  for (let i = 0; i < 30; i++) {
    // Limit depth movement to +-3 spaces
    let newX = Math.min(Math.max(Math.floor(Math.random() * 6 + darknetData.difficulty - 3), 0), NET_DEPTH - 1);
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
    sanitizeDarkwebNetwork();
    DarknetEvents.emit();
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
}

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
  if (server === DarknetState.openServer || server.isConnectedTo) {
    return false;
  }
  server.serversOnNetwork.forEach((conn) => {
    const connectedServer = GetServer(conn);
    const isOkToDisconnect = disconnectDarkweb || connectedServer?.hostname === SpecialServers.DarkWeb;
    if (connectedServer && isOkToDisconnect) {
      disconnectServers(server, connectedServer as Server);
    }
  });
};

export const restartServer = (server: BaseServer) => {
  if (server === DarknetState.openServer || server.isConnectedTo) {
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
  disconnectServer(server);
  addGuaranteedConnection(server);
  addGuaranteedConnection(server);
};

export const addGuaranteedConnection = (server: BaseServer) => {
  const darknetData = server.darknetData;
  if (!darknetData) {
    throw new Error("Server missing dark web data");
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
      DeleteServer(server.hostname);
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
};

const isOnAirGap = (x: number): boolean => !!x && !(x % AIR_GAP_DEPTH);

const notNull = <T>(value: T | null): value is T => value !== null;
