import { getDarkWebServer } from "./DarkWebServerGenerator";
import { DarkWebEvents, DarkWebNetwork, NET_DEPTH, NET_WIDTH } from "../models/DarkWebState";
import { connectServers, disconnectServers, GetServer } from "../../Server/AllServers";
import { Server } from "../../Server/Server";

const HORIZONTAL_CONNECTION_CHANCE = 0.6;
const VERTICAL_CONNECTION_CHANCE = 0.4;
const SERVER_DENSITY = 0.6;

export const populateDarkWebNetwork = () => {
  clearDarkWebNetwork();
  for (let i = 0; i < NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      if (Math.random() > SERVER_DENSITY) {
        continue;
      }
      const server = getDarkWebServer(i, 10 * i, i, j);
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

  for (let i = 0; i < 10; i++) {
    // max 10 attempts
    const newX = Math.floor(Math.random() * NET_DEPTH);
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

export const addServerToNetwork = (server: Server, x: number, y: number, addConnections = false) => {
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

  if (addConnections) {
    addRandomConnections(server);
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

  const serversAbove = getServersOnColumnAbove(x);
  const serversBelow = getServersOnColumnBelow(x);
  [...serversAbove, ...serversBelow].forEach((neighbor) => {
    const distance = Math.abs(neighbor.darkWebData?.x ?? x - x) + 1;
    if (Math.random() < VERTICAL_CONNECTION_CHANCE / distance) {
      connectServers(server, neighbor);
    }
  });
};

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

export const getServersOnColumnBelow = (x: number): Server[] => {
  return DarkWebNetwork[x - 1]?.filter(notNull<Server>) ?? [];
};

export const getServersOnColumnAbove = (x: number): Server[] => {
  return DarkWebNetwork[x + 1]?.filter(notNull<Server>) ?? [];
};

const notNull = <T>(value: T | null): value is T => value !== null;
