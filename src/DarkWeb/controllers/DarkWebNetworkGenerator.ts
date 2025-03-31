import {
  DarkWebState, NET_DEPTH, NET_WIDTH, SERVER_DENSITY,
} from "../models/DarkWebState";
import { connectServers, DeleteServer, GetAllServers, GetServer } from "../../Server/AllServers";
import {
  addGuaranteedConnection,
  addRandomServers, balanceServers,
  disconnectServer,
  getDarkWebServers,
  getNeighborsOnRow, getServersOnRowAbove, getServersOnRowBelow,
} from "./DarkWebNetworkMovement";
import { BaseServer } from "../../Server/BaseServer";
import { SpecialServers } from "../../Server/data/SpecialServers";

export const HORIZONTAL_CONNECTION_CHANCE = 0.5;
export const VERTICAL_CONNECTION_CHANCE = 0.3;
export const AIR_GAP_DEPTH = 8;

export const populateDarkWebNetwork = () => {
  if (GetAllServers().find((s) => s.darkWebData)) {
    loadDarkWebNetwork();
    return;
  }

  clearDarkWebNetwork();
  while (getDarkWebServers().length < NET_DEPTH * NET_WIDTH * SERVER_DENSITY) {
    addRandomServers();
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
  const darkwebRoot = GetServer(SpecialServers.DarkWeb);
  if (darkwebRoot) {
    darkwebRoot.serversOnNetwork = []
  }
};

export const loadDarkWebNetwork = () => {
  const darkWebServers = GetAllServers().filter(s => s.darkWebData);
  for (const server of darkWebServers) {
    if (server.darkWebData) {
      disconnectServer(server, true);
      addServerToNetwork(server, server.darkWebData.x, server.darkWebData.y, true);
    }
  }
  balanceServers();
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