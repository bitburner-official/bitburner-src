import { DarkWebServer } from "../models/DarkWebServer";
import { getDarkWebServer } from "./DarkWebServerGenerator";
import { DarkWebEvents, DarkWebNetwork } from "../models/DarkWebState";

const NET_WIDTH = 6;
const NET_DEPTH = 15;

const HORIZONTAL_CONNECTION_CHANCE = 0.6;
const VERTICAL_CONNECTION_CHANCE = 0.4;
const SERVER_DENSITY = 0.6;

export const getEmptyNetwork = (): (DarkWebServer | null)[][] =>
  new Array(NET_DEPTH).fill(null).map(() => new Array(NET_WIDTH).fill(null) as (DarkWebServer | null)[]);

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

export const moveServer = (server: DarkWebServer) => {
  for (let i = 0; i < 10; i++) { // max 10 attempts
    const newX = Math.floor(Math.random() * NET_DEPTH);
    const newY = Math.floor(Math.random() * NET_WIDTH);
    if (DarkWebNetwork[newX][newY] !== null) {
      continue;
    }
    server.connections.forEach((conn) => {
      const connectedServer = DarkWebNetwork[conn.x][conn.y];
      if (connectedServer) {
        disconnectServers(server, connectedServer);
      }
    });

    DarkWebNetwork[server.x][server.y] = null;
    addServerToNetwork(server, newX, newY, true);
    DarkWebEvents.emit();
    return true;
  }
}

export const addServerToNetwork = (server: DarkWebServer, x: number, y: number, addConnections = false) => {
  if (DarkWebNetwork[x]?.[y] === undefined) {
    throw new Error("Invalid coordinates");
  }
  if (DarkWebNetwork[x][y]?.id) {
    throw new Error("Server already exists at this location");
  }

  DarkWebNetwork[x][y] = server;
  server.x = x;
  server.y = y;

  if (addConnections) {
    addRandomConnections(server);
  }
};

export const addRandomConnections = (server: DarkWebServer) => {
  const x = server.x;
  const y = server.y;
  const horizontalNeighbors = getNeighborsOnRow(x, y);
  horizontalNeighbors.forEach((neighbor) => {
    if (Math.random() < HORIZONTAL_CONNECTION_CHANCE) {
      connectServers(server, neighbor);
    }
  });

  const serversAbove = getServersOnColumnAbove(x);
  const serversBelow = getServersOnColumnBelow(x);
  [...serversAbove, ...serversBelow].forEach((neighbor) => {
    const distance = Math.abs(neighbor.x - x) + 1;
    if (Math.random() < VERTICAL_CONNECTION_CHANCE / distance) {
      connectServers(server, neighbor);
    }
  });
};

export const connectServers = (server1: DarkWebServer, server2: DarkWebServer) => {
  server1.connections.push({
    id: server2.id,
    x: server2.x,
    y: server2.y,
  });
  server2.connections.push({
    id: server1.id,
    x: server1.x,
    y: server1.y,
  });
};

export const disconnectServers = (server1: DarkWebServer, server2: DarkWebServer) => {
  server1.connections = server1.connections.filter((conn) => conn.id !== server2.id);
  server2.connections = server2.connections.filter((conn) => conn.id !== server1.id);
}

export const getNeighborsOnRow = (x: number, y: number): DarkWebServer[] => {
  const neighbors: DarkWebServer[] = [];
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

export const getServersOnColumnBelow = (x: number): DarkWebServer[] => {
  return DarkWebNetwork[x - 1]?.filter(notNull<DarkWebServer>) ?? [];
};

export const getServersOnColumnAbove = (x: number): DarkWebServer[] => {
  return DarkWebNetwork[x + 1]?.filter(notNull<DarkWebServer>) ?? [];
};

const notNull = <T>(value: T | null): value is T => value !== null;
