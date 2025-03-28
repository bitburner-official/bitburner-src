import { getDarkWebServer } from "./DarkWebServerGenerator";
import { DarkWebEvents, DarkWebState, NET_DEPTH, NET_WIDTH, SERVER_DENSITY } from "../models/DarkWebState";
import { connectServers, DeleteServer, disconnectServers, GetAllServers, GetServer } from "../../Server/AllServers";
import { Server } from "../../Server/Server";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { BaseServer } from "../../Server/BaseServer";

const HORIZONTAL_CONNECTION_CHANCE = 0.5;
const VERTICAL_CONNECTION_CHANCE = 0.3;
const AIR_GAP_DEPTH = 8;

export const populateDarkWebNetwork = () => {
  if (GetAllServers().find((s) => s.darkWebData)) {
    loadDarkWebNetwork();
    return;
  }

  clearDarkWebNetwork();
  while (getDarkWebServers().length < NET_DEPTH * NET_WIDTH * SERVER_DENSITY) {
    addRandomServer();
  }

};

export const clearDarkWebNetwork = () => {
  for (let i = 0; i < NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      const server = DarkWebState.DarkWebNetwork[i][j];
      DeleteServer(server?.hostname ?? "");
      DarkWebState.DarkWebNetwork[i][j] = null;
    }
  }
};

export const loadDarkWebNetwork = () => {
  const darkWebServers = GetAllServers().filter(s => s.darkWebData);
  for (const server of darkWebServers) {
    if (server.darkWebData) {
      disconnectServer(server);
      addServerToNetwork(server, server.darkWebData.x, server.darkWebData.y, true);
    }
  }
}

export const addRandomServer = () => {
  const difficulty = Math.floor(Math.random() * NET_DEPTH);
  const newServer = getDarkWebServer(difficulty, -1, -1);
  const success = moveServer(newServer);
  if (!success) {
    DeleteServer(newServer.hostname);
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
    // Limit depth movement to +-2 spaces
    let newX = Math.min(Math.max(Math.floor(Math.random() * 5 + darkWebData.difficulty - 2), 0), NET_DEPTH - 1);
    // simple "air gaps" in the network
    if (isOnAirGap(newX)) {
      newX += Math.random() < 0.5 ? -1 : 1;
    }

    const newY = Math.floor(Math.random() * NET_WIDTH);
    if (DarkWebState.DarkWebNetwork[newX][newY] !== null) {
      console.log(`attempted to place on ${newX}, ${newY} but it was occupied`);
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

export const addServerToNetwork = (server: BaseServer, x: number, y: number, addConnections = true) => {
  if (DarkWebState.DarkWebNetwork[x]?.[y] === undefined) {
    console.error("Invalid coordinates");
    return;
  }
  if (DarkWebState.DarkWebNetwork[x][y]?.hostname) {
    console.error("Server already exists at this location");
    return;
  }
  if (!server.darkWebData) {
    console.error("Server missing dark web data");
    return;
  }

  DarkWebState.DarkWebNetwork[x][y] = server;
  server.darkWebData.x = x;
  server.darkWebData.y = y;

  if (!addConnections) {
    return;
  }
  addRandomConnections(server);
  addGuaranteedConnection(server);
  if (server.darkWebData.x === 0) {
    const darkWebRoot = GetServer(SpecialServers.DarkWeb);
    if (!darkWebRoot) {
      throw new Error("Could not find darkweb root server");
    }
    connectServers(server, darkWebRoot);
  }
};

export const disconnectServer = (server: BaseServer) => {
  server.serversOnNetwork.forEach((conn) => {
    const connectedServer = GetServer(conn);
    if (connectedServer) {
      disconnectServers(server, connectedServer as Server);
    }
  });
}

export const addRandomConnections = (server: BaseServer) => {
  const darkWebData = server.darkWebData;
  if (!darkWebData) {
    throw new Error("Server missing dark web data");
  }
  const x = darkWebData.x;
  const y = darkWebData.y;
  const horizontalNeighbors = getNeighborsOnRow(x, y);
  horizontalNeighbors.forEach((neighbor) => {
    if (Math.random() < HORIZONTAL_CONNECTION_CHANCE) {
      connectServers(server, neighbor);
    }
  });

  const serversAbove = getServersOnRowAbove(x);
  const serversBelow = getServersOnRowBelow(x);
  [...serversAbove, ...serversBelow].forEach((neighbor) => {
    const distance = Math.abs(neighbor.darkWebData?.x ?? x - x) + 1;
    if (Math.random() < VERTICAL_CONNECTION_CHANCE / distance) {
      connectServers(server, neighbor);
    }
  });
};

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
