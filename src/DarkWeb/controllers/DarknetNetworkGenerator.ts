import { DarknetState, NET_DEPTH, NET_WIDTH, SERVER_DENSITY } from "../models/DarknetState";
import { connectServers, DeleteServer, GetAllServers, GetServer } from "../../Server/AllServers";
import {
  addGuaranteedConnection,
  addRandomServers,
  balanceServers,
  disconnectServer,
  getDarknetServers,
  getNeighborsOnRow,
  getServersOnRowAbove,
  getServersOnRowBelow,
} from "./DarknetNetworkMovement";
import { BaseServer } from "../../Server/BaseServer";
import { SpecialServers } from "../../Server/data/SpecialServers";

export const HORIZONTAL_CONNECTION_CHANCE = 0.5;
export const VERTICAL_CONNECTION_CHANCE = 0.3;
export const AIR_GAP_DEPTH = 8;

export const populateDarknet = () => {
  if (GetAllServers(true).find((s) => s.darknetData)) {
    loadDarknet();
    return;
  }

  clearDarknet();
  while (getDarknetServers().length < NET_DEPTH * NET_WIDTH * SERVER_DENSITY) {
    addRandomServers();
  }
  const updatedServers = GetAllServers(true).filter((s) => s.darknetData);
  for (let i = 0; i < NET_DEPTH; i++) {
    const server = updatedServers[Math.floor(Math.random() * updatedServers.length)];
    addGuaranteedConnection(server);
  }
};

export const clearDarknet = () => {
  for (let i = 0; i < NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      const server = DarknetState.Network[i][j];
      DeleteServer(server?.hostname ?? "");
      DarknetState.Network[i][j] = null;
    }
  }
  const darkwebRoot = GetServer(SpecialServers.DarkWeb);
  if (darkwebRoot) {
    darkwebRoot.serversOnNetwork = [];
  }
};

export const loadDarknet = () => {
  const darkWebServers = GetAllServers(true).filter((s) => s.darknetData);
  for (const server of darkWebServers) {
    if (server.darknetData) {
      disconnectServer(server, true);
      addServerToNetwork(server, server.darknetData.x, server.darknetData.y, true);
    }
  }
  balanceServers();

  const updatedServers = GetAllServers(true).filter((s) => s.darknetData);
  for (let i = 0; i < NET_DEPTH; i++) {
    const server = updatedServers[Math.floor(Math.random() * updatedServers.length)];
    addGuaranteedConnection(server);
  }
};

export const addRandomConnections = (server: BaseServer) => {
  const darknetData = server.darknetData;
  if (!darknetData) {
    throw new Error("Server missing dark web data");
  }
  const x = darknetData.x;
  const y = darknetData.y;
  const horizontalNeighbors = getNeighborsOnRow(x, y);
  horizontalNeighbors.forEach((neighbor) => {
    if (Math.random() < HORIZONTAL_CONNECTION_CHANCE) {
      connectServers(server, neighbor);
    }
  });

  const serversAbove = getServersOnRowAbove(x);
  const serversBelow = getServersOnRowBelow(x);
  [...serversAbove, ...serversBelow].forEach((neighbor) => {
    const distance = Math.abs(neighbor.darknetData?.x ?? x - x) + 1;
    if (Math.random() < VERTICAL_CONNECTION_CHANCE / distance) {
      connectServers(server, neighbor);
    }
  });
};

export const addServerToNetwork = (server: BaseServer, x: number, y: number, addConnections = true) => {
  if (DarknetState.Network[x]?.[y] === undefined) {
    console.error("Invalid coordinates");
    return;
  }
  if (DarknetState.Network[x][y]?.hostname) {
    console.error("Server already exists at this location");
    return;
  }
  if (!server.darknetData) {
    console.error("Server missing dark web data");
    return;
  }

  DarknetState.Network[x][y] = server;
  server.darknetData.x = x;
  server.darknetData.y = y;

  if (!addConnections) {
    return;
  }
  addRandomConnections(server);
  addGuaranteedConnection(server);

  if (server.darknetData.x === 0) {
    const darkWebRoot = GetServer(SpecialServers.DarkWeb);
    if (!darkWebRoot) {
      throw new Error("Could not find darkweb root server");
    }
    connectServers(server, darkWebRoot);
  }
};
