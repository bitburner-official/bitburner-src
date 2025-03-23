import { DarkWebServer } from "../models/DarkWebServer";
import { getDarkWebServer } from "./DarkWebServerGenerator";
import { DarkWebEvents, DarkWebNetwork, NET_DEPTH, NET_WIDTH } from "../models/DarkWebState";
import { AddToAllServers, createUniqueRandomIp, GetServer } from "../../Server/AllServers";
import { IConstructorParams, Server } from "../../Server/Server";

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
      addServerToNetwork(server, i, j, true, true);
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

export const addServerToNetwork = (server: DarkWebServer, x: number, y: number, addConnections = false, addToStandardNetwork = false) => {
  if (DarkWebNetwork[x]?.[y] === undefined) {
    throw new Error("Invalid coordinates");
  }
  if (DarkWebNetwork[x][y]?.id) {
    throw new Error("Server already exists at this location");
  }

  DarkWebNetwork[x][y] = server;
  server.x = x;
  server.y = y;

  if (addToStandardNetwork) {
    addServerToStandardNetwork(server);
  }

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
  const standardServer = GetServer(server1.id);
  if (!standardServer) {
    console.error(`Server ${server1?.id} ${server1.x},${server1.y} not found in standard network`);
    return;
  }
  const neighborStandardServer =  GetServer(server2.id);
  if (!neighborStandardServer ) {
    console.error(`Neighbor server ${server2?.id} ${server2.x},${server2.y} not found in standard network`);
    return;
  }

  standardServer.serversOnNetwork.push(neighborStandardServer.hostname);
  neighborStandardServer.serversOnNetwork.push(standardServer.hostname);

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
  const standardServer =  GetServer(server1.id);
  if (!standardServer) {
    console.error(`Server ${server1?.id} ${server1.x},${server1.y} not found in standard network`);
    return;
  }
  const neighborStandardServer =  GetServer(server2.id);
  if (!neighborStandardServer ) {
    console.error(`Neighbor server ${server2?.id} ${server2.x},${server2.y} not found in standard network`);
    return;
  }
  standardServer.serversOnNetwork = standardServer.serversOnNetwork.filter((hostname) => hostname !== neighborStandardServer.hostname);
  neighborStandardServer.serversOnNetwork = neighborStandardServer.serversOnNetwork.filter((hostname) => hostname !== standardServer.hostname);


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

export const addServerToStandardNetwork = (server: DarkWebServer) => {
  const params: IConstructorParams = {
    hostname: server.id,
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    requiredHackingSkill: server.difficulty,
    hackDifficulty: server.difficulty,
    moneyAvailable: 0,
    numOpenPortsRequired: 5,
    serverGrowth: 1,
    adminRights: false,
  }
  const standardServer = new Server(params);
  standardServer.backdoorInstalled = true;
  AddToAllServers(standardServer);
  console.log("Added ", server.id, " to standard network");
}

const notNull = <T>(value: T | null): value is T => value !== null;
