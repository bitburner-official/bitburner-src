import { connectServers, DeleteServer, disconnectServers, GetServer } from "../../Server/AllServers";
import { DarkWebEvents, DarkWebState, NET_DEPTH, NET_WIDTH, SERVER_DENSITY } from "../models/DarkWebState";
import { getDarkWebServer } from "./DarkWebServerGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";
import {
  addServerToNetwork,
  AIR_GAP_DEPTH,
} from "./DarkWebNetworkGenerator";
import { stopAndCleanUpWorkerScript } from "../../Netscript/killWorkerScript";
import { workerScripts } from "../../Netscript/WorkerScripts";


export const mutateDarkWeb = () => {
  const servers = getDarkWebServers();
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
}

const deleteRandomServers = (count = 1) => {
  for (let i = 0; i < count; i++) {
    const servers = getDarkWebServers();
    const serverToDelete = servers[Math.floor(Math.random() * servers.length)];
    disconnectServer(serverToDelete);
    DeleteServer(serverToDelete.hostname);
  }
}


export const addRandomServers = (count = 1) => {
  for (let i = 0; i < count; i++) {
    const difficulty = Math.floor(Math.random() * NET_DEPTH);
    const newServer = getDarkWebServer(difficulty, -1, -1);
    const success = moveServer(newServer);
    if (!success) {
      DeleteServer(newServer.hostname);
    }
  }
}

export const balanceServers = () => {
  if (getDarkWebServers().length > NET_DEPTH * NET_WIDTH * SERVER_DENSITY) {
    const serversToRemove = getDarkWebServers().length - NET_DEPTH * NET_WIDTH * SERVER_DENSITY;
    deleteRandomServers(serversToRemove);
  } else {
    const serversToAdd = NET_DEPTH * NET_WIDTH * SERVER_DENSITY - getDarkWebServers().length;
    addRandomServers(serversToAdd);
  }
}

export const moveServer = (server: BaseServer) => {
  const darkWebData = server.darkWebData;
  if (!darkWebData) {
    throw new Error("Server missing dark web data");
  }
  // Do not try to move the server that is open in the UI
  if (server === DarkWebState.openServer) {
    return false;
  }

  // max 10 attempts to move the server
  for (let i = 0; i < 10; i++) {
    // Limit depth movement to +-3 spaces
    let newX = Math.min(Math.max(Math.floor(Math.random() * 6 + darkWebData.difficulty - 3), 0), NET_DEPTH - 1);
    // simple "air gaps" in the network
    if (isOnAirGap(newX)) {
      newX += Math.random() < 0.5 ? -1 : 1;
    }

    const newY = Math.floor(Math.random() * NET_WIDTH);
    if (DarkWebState.DarkWebNetwork[newX][newY] !== null) {
      continue;
    }

    disconnectServer(server);

    if (DarkWebState.DarkWebNetwork[darkWebData.x]?.[darkWebData.y]) {
      DarkWebState.DarkWebNetwork[darkWebData.x][darkWebData.y] = null;
    }
    addServerToNetwork(server, newX, newY, true);
    DarkWebEvents.emit();
    return true;
  }
  return false;
};


export const disconnectServer = (server: BaseServer) => {
  server.serversOnNetwork.forEach((conn) => {
    const connectedServer = GetServer(conn);
    if (connectedServer) {
      disconnectServers(server, connectedServer as Server);
    }
  });
}

export const restartServer = (server: BaseServer) => {
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
}

export const addGuaranteedConnection = (server: BaseServer) => {
  const darkWebData = server.darkWebData;
  if (!darkWebData) {
    throw new Error("Server missing dark web data");
  }

  const neighbors = getAllAdjacentNeighbors(darkWebData.x ?? 0, darkWebData.y ?? 0);
  if (neighbors.length === 0) {
    return;
  }
  const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
  connectServers(server, neighbor);
}


export const getNeighborsOnRow = (x: number, y: number): BaseServer[] => {
  const neighbors: BaseServer[] = [];
  const leftNeighbor = DarkWebState.DarkWebNetwork[x][y - 1];
  const rightNeighbor = DarkWebState.DarkWebNetwork[x][y + 1];
  if (leftNeighbor) {
    neighbors.push(leftNeighbor);
  }
  if (rightNeighbor) {
    neighbors.push(rightNeighbor);
  }
  return neighbors;
};

export const getServersOnRowBelow = (x: number, close = false): BaseServer[] => {
  const rowBelow = DarkWebState.DarkWebNetwork[x - 1]?.filter(notNull<BaseServer>) ?? [];
  if (close) {
    return rowBelow.filter((server) => Math.abs(server.darkWebData?.y ?? 0 - x) <= 1);
  }
  return rowBelow;
};

export const getServersOnRowAbove = (x: number, close = false): BaseServer[] => {
  const rowAbove = DarkWebState.DarkWebNetwork[x + 1]?.filter(notNull<BaseServer>) ?? [];
  if (close) {
    return rowAbove.filter((server) => Math.abs(server.darkWebData?.y ?? 0 - x) <= 1);
  }
  return rowAbove;
};

export const getDarkWebServers = (): BaseServer[] => {
  return DarkWebState.DarkWebNetwork.flat().filter(notNull<BaseServer>);
};

const getAllAdjacentNeighbors = (x: number, y: number): BaseServer[] => {
  const rowAbove = getServersOnRowAbove(x, true);
  const rowBelow = getServersOnRowBelow(x, true);
  const neighborsOnRow = getNeighborsOnRow(x, y);
  return [...rowAbove, ...rowBelow, ...neighborsOnRow];
}

const isOnAirGap = (x: number): boolean => !!x && !(x % AIR_GAP_DEPTH);

const notNull = <T>(value: T | null): value is T => value !== null;