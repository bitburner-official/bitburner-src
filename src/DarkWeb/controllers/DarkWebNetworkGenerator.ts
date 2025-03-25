import { getDarkWebServer } from "./DarkWebServerGenerator";
import { DarkWebEvents, DarkWebNetwork, NET_DEPTH, NET_WIDTH } from "../models/DarkWebState";
import { connectServers, disconnectServers, GetServer } from "../../Server/AllServers";
import { Server } from "../../Server/Server";
import { SpecialServers } from "../../Server/data/SpecialServers";

const HORIZONTAL_CONNECTION_CHANCE = 0.6;
const VERTICAL_CONNECTION_CHANCE = 0.4;
const SERVER_DENSITY = 0.6;
const AIR_GAP_DEPTH = 8;

export const populateDarkWebNetwork = () => {
  clearDarkWebNetwork();
  for (let i = 0; i < NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      if (Math.random() > SERVER_DENSITY || isOnAirGap(i)) {
        continue;
      }
      const server = getDarkWebServer(i, i, j);
      addServerToNetwork(server, i, j, true);
    }
  }
};

export const clearDarkWebNetwork = () => {
  for (let i = 0; i < NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      DarkWebNetwork[i][j] = null;
    }
  }
};

export const moveServer = (server: Server) => {
  const darkWebData = server.darkWebData;
  if (!darkWebData) {
    throw new Error("Server missing dark web data");
  }

  // max 10 attempts to move the server
  for (let i = 0; i < 10; i++) {
    // Limit depth movement to +-2 spaces
    let newX = Math.min(Math.max(Math.floor(Math.random() * 5 + darkWebData.x - 2), 0), NET_DEPTH - 1);
    // simple "air gaps" in the network
    if (isOnAirGap(newX)) {
      newX += Math.random() < 0.5 ? -1 : 1;
    }

    const newY = Math.floor(Math.random() * NET_WIDTH);
    if (DarkWebNetwork[newX][newY] !== null) {
      continue;
    }
    server.serversOnNetwork.forEach((conn) => {
      const connectedServer = GetServer(conn);
      if (connectedServer) {
        disconnectServers(server, connectedServer as Server);
      }
    });

    DarkWebNetwork[darkWebData.x][darkWebData.y] = null;
    addServerToNetwork(server, newX, newY, true);
    DarkWebEvents.emit();
    return true;
  }
};

export const addServerToNetwork = (server: Server, x: number, y: number, addConnections = true) => {
  if (DarkWebNetwork[x]?.[y] === undefined) {
    throw new Error("Invalid coordinates");
  }
  if (DarkWebNetwork[x][y]?.hostname) {
    throw new Error("Server already exists at this location");
  }
  if (!server.darkWebData) {
    throw new Error("Server missing dark web data");
  }

  DarkWebNetwork[x][y] = server;
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

export const addRandomConnections = (server: Server) => {
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

export const addGuaranteedConnection = (server: Server) => {
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


export const getNeighborsOnRow = (x: number, y: number): Server[] => {
  const neighbors: Server[] = [];
  const leftNeighbor = DarkWebNetwork[x][y - 1];
  const rightNeighbor = DarkWebNetwork[x][y + 1];
  if (leftNeighbor) {
    neighbors.push(leftNeighbor);
  }
  if (rightNeighbor) {
    neighbors.push(rightNeighbor);
  }
  return neighbors;
};

export const getServersOnRowBelow = (x: number, close = false): Server[] => {
  const rowBelow = DarkWebNetwork[x - 1]?.filter(notNull<Server>) ?? [];
  if (close) {
    return rowBelow.filter((server) => Math.abs(server.darkWebData?.y ?? 0 - x) <= 1);
  }
  return rowBelow;
};

export const getServersOnRowAbove = (x: number, close = false): Server[] => {
  const rowAbove = DarkWebNetwork[x + 1]?.filter(notNull<Server>) ?? [];
  if (close) {
    return rowAbove.filter((server) => Math.abs(server.darkWebData?.y ?? 0 - x) <= 1);
  }
  return rowAbove;
};

export const getDarkWebServers = (): Server[] => {
  return DarkWebNetwork.flat().filter(notNull<Server>);
};

const getAllAdjacentNeighbors = (x: number, y: number): Server[] => {
  const rowAbove = getServersOnRowAbove(x, true);
  const rowBelow = getServersOnRowBelow(x, true);
  const neighborsOnRow = getNeighborsOnRow(x, y);
  return [...rowAbove, ...rowBelow, ...neighborsOnRow];
}

const isOnAirGap = (x: number): boolean => !!x && !(x % AIR_GAP_DEPTH);

const notNull = <T>(value: T | null): value is T => value !== null;
