import { DarknetState, MAX_NET_DEPTH, NET_WIDTH, SERVER_DENSITY } from "../models/DarknetState";
import { AddToAllServers, connectServers, createUniqueRandomIp, GetServer } from "../../Server/AllServers";
import {
  addGuaranteedConnection,
  addRandomServers,
  balanceServers,
  deleteServer,
  disconnectServer,
  getDarknetServers,
  getNeighborsOnRow,
  getServersOnRowAbove,
  getServersOnRowBelow,
} from "./DarknetNetworkMovement";
import { BaseServer } from "../../Server/BaseServer";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { DnetServer } from "../models/DnetServerData";
import { Minigames } from "./DarknetServerGenerator";
import { labIcon } from "./ServerIcon";
import { Player } from "@player";
import { Terminal } from "../../Terminal";
import {
  getLabyrinthChaiRequirement,
  getLabyrinthDetails,
  getLabyrinthServerNames,
  getNetDepth,
  isLabyrinthServer,
} from "../models/labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";
import { getDarknetData, isDarknetServer } from "../models/effects";

export const HORIZONTAL_CONNECTION_CHANCE = 0.5;
export const VERTICAL_CONNECTION_CHANCE = 0.3;
export const AIR_GAP_DEPTH = 8;

export const populateDarknet = () => {
  const darkWebRoot = GetServer(SpecialServers.DarkWeb);
  if (darkWebRoot) {
    darkWebRoot.hasAdminRights = true;
    darkWebRoot.maxRam = 16; // TODO: make this more graceful?
  }

  if (getDarknetServers().length) {
    loadDarknet();
    return;
  }

  clearDarknet(true);
  addLabyrinth();
  // TODO: improve early net generation
  addRandomServers(getNetDepth() * NET_WIDTH * SERVER_DENSITY - 10);
  addRandomServers(5 - DarknetState.Network[0].length);
  addRandomServers(5 - DarknetState.Network[1].length);
  balanceServers();

  const updatedServers = getDarknetServers();
  for (let i = 0; i < getNetDepth(); i++) {
    const server = updatedServers[Math.floor(Math.random() * updatedServers.length)];
    addGuaranteedConnection(server);
  }
};

export const clearDarknet = (force = false) => {
  movePlayerIfNeeded();
  for (let i = 0; i < MAX_NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      const server = DarknetState.Network[i]?.[j];
      if (!server) continue;
      deleteServer(server, force);
      DarknetState.Network[i][j] = null;
    }
  }
  const darkwebRoot = GetServer(SpecialServers.DarkWeb);
  if (darkwebRoot) {
    darkwebRoot.serversOnNetwork = [Player.getHomeComputer().hostname];
  }

  for (const lab of getLabyrinthServerNames()) {
    const labyrinth = GetServer(lab);
    if (!labyrinth) continue;
    deleteServer(labyrinth);
  }
};

export const movePlayerIfNeeded = (server?: BaseServer) => {
  const connectedServer = Player.getCurrentServer();
  if ((!server && isDarknetServer(connectedServer)) || server?.hostname === connectedServer.hostname) {
    Terminal.print(`Something seems to have happened to '${connectedServer.hostname}'...`);
    Terminal.connectToServer(SpecialServers.Home);
  }
};

export const loadDarknet = () => {
  const darkWebServers = getDarknetServers();
  for (const server of darkWebServers) {
    if (server.darknetData && !isLabyrinthServer(server.hostname)) {
      disconnectServer(server, true);
      addServerToNetwork(server, server.darknetData.x, server.darknetData.y);
    }
  }
  balanceServers();

  const updatedServers = getDarknetServers();
  for (let i = 0; i < getNetDepth(); i++) {
    const server = updatedServers[Math.floor(Math.random() * updatedServers.length)];
    addGuaranteedConnection(server);
  }
};

export const addRandomConnections = (server: BaseServer) => {
  const darknetData = getDarknetData(server);
  if (!darknetData || isLabyrinthServer(server.hostname)) {
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

export const addServerToNetwork = (server: BaseServer, x: number, y: number) => {
  if (DarknetState.Network[x]?.[y] === undefined) {
    console.error("Invalid coordinates");
    return;
  }
  if (DarknetState.Network[x][y]?.hostname) {
    console.error("Server already exists at this location");
    return;
  }
  if (!isDarknetServer(server)) {
    console.error("Server missing dark web data");
    return;
  }

  DarknetState.Network[x][y] = server;
  server.darknetData.x = x;
  server.darknetData.y = y;

  addRandomConnections(server);
  addGuaranteedConnection(server);

  if (server.darknetData.x === 0) {
    const darkWebRoot = GetServer(SpecialServers.DarkWeb);
    if (darkWebRoot) {
      connectServers(server, darkWebRoot);
    }
  }
  const maxDepth = getNetDepth();
  if (server.darknetData.x === maxDepth - 1) {
    const labyrinth = getLabyrinthDetails().lab;
    if (labyrinth) {
      connectServers(server, labyrinth);
    }
  }
};

// Creates all the special servers for use at the bottom of the dark net
export const addLabyrinth = () => {
  const darknetData: DnetServer = {
    icon: labIcon,
    password: "!!the:masterwork:of:daedalus!!",
    staticPasswordHint: "You have discovered a dark, mysterious maze. Your footsteps echo eerily in the silence.",
    minigameType: Minigames.labyrinth,
    difficulty: 10,
    x: -1,
    y: -1,
    hasStasisLink: false,
    ramBlock: 0,
    logTrafficInterval: Number.MAX_SAFE_INTEGER,
  };

  const params = {
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    maxRam: 128,
    hackDifficulty: 10,
    moneyAvailable: 0,
    numOpenPortsRequired: 69,
    adminRights: false,
    darknetData,
  };

  for (const hostname of getLabyrinthServerNames()) {
    const cha = getLabyrinthChaiRequirement(hostname);
    const server = new DarknetServer({
      ...params,
      requiredHackingSkill: cha,
      hostname: hostname,
    });
    AddToAllServers(server);
  }
};
