import { DarknetState, NET_DEPTH, NET_WIDTH, SERVER_DENSITY } from "../models/DarknetState";
import {
  AddToAllServers,
  connectServers,
  createUniqueRandomIp,
  GetAllServers,
  GetServer,
} from "../../Server/AllServers";
import {
  addGuaranteedConnection,
  addRandomServers,
  balanceServers,
  deleteServer,
  disconnectServer,
  getNeighborsOnRow,
  getServersOnRowAbove,
  getServersOnRowBelow,
} from "./DarknetNetworkMovement";
import { BaseServer } from "../../Server/BaseServer";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { IConstructorParams, Server } from "../../Server/Server";
import { DnetServerData } from "../models/DnetServerData";
import { Minigames } from "./DarknetServerGenerator";
import { labIcon } from "./ServerIcon";
import { Player } from "@player";
import { Terminal } from "../../Terminal";

export const HORIZONTAL_CONNECTION_CHANCE = 0.5;
export const VERTICAL_CONNECTION_CHANCE = 0.3;
export const AIR_GAP_DEPTH = 8;

export const populateDarknet = () => {
  const darkWebRoot = GetServer(SpecialServers.DarkWeb);
  if (darkWebRoot) {
    darkWebRoot.hasAdminRights = true;
    darkWebRoot.maxRam = 16; // TODO: make this more graceful?
  }

  if (GetAllServers(true).find((s) => s.darknetData)) {
    loadDarknet();
    return;
  }

  clearDarknet();
  addLabyrinth();
  // TODO: improve early net generation
  addRandomServers(NET_DEPTH * NET_WIDTH * SERVER_DENSITY - 10);
  addRandomServers(5 - DarknetState.Network[0].length);
  addRandomServers(5 - DarknetState.Network[1].length);
  addRandomServers(4 - DarknetState.Network[2].length);
  addRandomServers(4 - DarknetState.Network[3].length);
  balanceServers();

  const updatedServers = GetAllServers(true).filter((s) => s.darknetData);
  for (let i = 0; i < NET_DEPTH; i++) {
    const server = updatedServers[Math.floor(Math.random() * updatedServers.length)];
    addGuaranteedConnection(server);
  }
};

export const clearDarknet = () => {
  movePlayerIfNeeded();
  for (let i = 0; i < NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      const server = DarknetState.Network[i][j];
      if (!server) continue;
      deleteServer(server);
      DarknetState.Network[i][j] = null;
    }
  }
  const darkwebRoot = GetServer(SpecialServers.DarkWeb);
  if (darkwebRoot) {
    darkwebRoot.serversOnNetwork = [Player.getHomeComputer().hostname];
  }
  const labyrinth = GetServer(SpecialServers.Labyrinth);
  if (labyrinth) {
    deleteServer(labyrinth);
  }
};

export const movePlayerIfNeeded = () => {
  const connectedServer = Player.getCurrentServer();
  if (connectedServer.darknetData) {
    Terminal.connectToServer("home");
  }
};

export const loadDarknet = () => {
  const darkWebServers = GetAllServers(true).filter((s) => s.darknetData);
  for (const server of darkWebServers) {
    if (server.darknetData && server.hostname !== SpecialServers.Labyrinth) {
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
  if (!darknetData || server.hostname === SpecialServers.Labyrinth) {
    return;
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
    if (darkWebRoot) {
      connectServers(server, darkWebRoot);
    }
  }
  if (server.darknetData.x === NET_DEPTH - 1) {
    const labyrinth = GetServer(SpecialServers.Labyrinth);
    if (labyrinth) {
      connectServers(server, labyrinth);
    }
  }
};

// Creates a special server at the bottom of the dark net
export const addLabyrinth = () => {
  const darknetData: DnetServerData = {
    icon: labIcon,
    password: "!!the:masterwork:of:daedalus!!",
    passwordHint: "Find the exit",
    minigameType: Minigames.labyrinth,
    difficulty: 50,
    x: -1,
    y: -1,
  };

  const params: IConstructorParams = {
    hostname: SpecialServers.Labyrinth,
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    maxRam: 128,
    requiredHackingSkill: 3000, // TODO: bitnode multiplier
    hackDifficulty: 5,
    moneyAvailable: 0,
    numOpenPortsRequired: 69,
    adminRights: false,
    darknetData,
  };
  const server = new Server(params);
  AddToAllServers(server);
};
