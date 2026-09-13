import { DarknetState } from "../models/DarknetState";
import {
  AddToAllServers,
  connectServers,
  createUniqueRandomIp,
  DeleteServer,
  disconnectServers,
  GetServer,
} from "../../Server/AllServers";
import {
  addGuaranteedConnection,
  addRandomDarknetServers,
  balanceDarknetServers,
  deleteDarknetServer,
  disconnectServer,
} from "./NetworkMovement";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { Player } from "@player";
import { Terminal } from "../../Terminal";
import {
  getLabyrinthChaRequirement,
  getLabyrinthDetails,
  getLabyrinthServerNames,
  getNetDepth,
  isLabyrinthServer,
} from "../effects/labyrinth";
import { DarknetServer, type DarknetServerConstructorParams } from "../../Server/DarknetServer";
import {
  HORIZONTAL_CONNECTION_CHANCE,
  MAX_NET_DEPTH,
  ModelIds,
  NET_WIDTH,
  SERVER_DENSITY,
  VERTICAL_CONNECTION_CHANCE,
} from "../Enums";
import { DarknetServerOptions, DnetServerBuilder } from "../models/DarknetServerOptions";
import {
  getAllDarknetServers,
  getAllMovableDarknetServers,
  getNeighborsOnRow,
  getServersOnRowAbove,
  getServersOnRowBelow,
} from "../utils/darknetNetworkUtils";
import { getDarknetServer } from "../utils/darknetServerUtils";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";
import { JSONMap } from "../../Types/Jsonable";
import type { ScriptFilePath } from "../../Paths/ScriptFilePath";
import type { Script } from "../../Script/Script";
import type { CodingContract } from "../../CodingContract/Contract";
import { getTorRouter } from "../../Server/ServerHelpers";

export function initDarkwebServer(): void {
  const existingServer = GetServer(SpecialServers.DarkWeb);
  if (existingServer instanceof DarknetServer) {
    return;
  }
  let scripts = new JSONMap<ScriptFilePath, Script>();
  let contracts: CodingContract[] = [];
  const hasTOR = Player.hasTorRouter();
  if (existingServer) {
    scripts = existingServer.scripts;
    contracts = existingServer.contracts;
    // Remove legacy darkweb server, so it can be made into a darknet server
    disconnectServers(existingServer, Player.getHomeComputer());
    DeleteServer(existingServer.hostname);
  }

  const data: DarknetServerOptions = {
    password: "",
    modelId: ModelIds.NoPassword,
    staticPasswordHint: "There is no password",
    leftOffset: -1,
    depth: -1,
    difficulty: 0,
    name: SpecialServers.DarkWeb,
    preventBlockedRam: true,
  };

  const darkweb = DnetServerBuilder(data);
  darkweb.isStationary = true;
  darkweb.hasAdminRights = true;
  darkweb.blockedRam = 0;
  darkweb.maxRam = 16;
  darkweb.scripts = scripts;
  darkweb.contracts = contracts;
  if (hasTOR) {
    getTorRouter();
  }
}

export const populateDarknet = () => {
  initDarkwebServer();

  if (getAllMovableDarknetServers().length) {
    loadDarknet();
    return;
  }

  clearDarknet();
  addLabyrinth();
  addRandomDarknetServers(getNetDepth() * NET_WIDTH * SERVER_DENSITY - 10);
  addRandomDarknetServers(5 - DarknetState.Network[0].length);
  addRandomDarknetServers(5 - DarknetState.Network[1].length);
  balanceDarknetServers();

  const updatedServers = getAllMovableDarknetServers();
  for (let i = 0; i < getNetDepth(); i++) {
    const server = updatedServers[Math.floor(Math.random() * updatedServers.length)];
    addGuaranteedConnection(server);
  }
};

export const clearDarknet = () => {
  movePlayerIfNeeded();
  for (let i = 0; i < MAX_NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      const server = DarknetState.Network[i]?.[j];
      if (!server) continue;
      deleteDarknetServer(server, true);
      DarknetState.Network[i][j] = null;
    }
  }
  const darkwebRoot = GetServer(SpecialServers.DarkWeb);
  if (darkwebRoot) {
    darkwebRoot.serversOnNetwork = Player.hasTorRouter() ? [Player.getHomeComputer().hostname] : [];
  }

  for (const lab of getLabyrinthServerNames()) {
    const labyrinth = getDarknetServer(lab);
    if (!labyrinth) continue;
    deleteDarknetServer(labyrinth);
  }

  DarknetState.zoomIndex = 7;
  DarknetState.netViewLeftScroll = 0;
  DarknetState.netViewTopScroll = 0;
  DarknetState.mutationLock?.();
  DarknetState.openServer = null;
  DarknetState.stockPromotions = {};
  DarknetState.migrationInductionServers = new Map();
  DarknetState.serverState = new Map();
};

export const movePlayerIfNeeded = (server?: DarknetServer) => {
  const connectedServer = Player.getCurrentServer();
  if ((!server && connectedServer instanceof DarknetServer) || server?.hostname === connectedServer.hostname) {
    Terminal.print(`Something seems to have happened to '${connectedServer.hostname}'...`);
    Terminal.connectToServer(SpecialServers.Home);
  }
};

/**
 * Loads all the darknet servers into DarknetState.Network, if it is not already populated
 */
export const loadDarknet = () => {
  const currentServers = DarknetState.Network.flat().filter((s) => s !== null && !s.isStationary);
  if (currentServers.length) {
    return;
  }

  const darkNetServers = getAllDarknetServers();
  for (const server of darkNetServers) {
    if (isLabyrinthServer(server.hostname) || server.hostname === SpecialServers.DarkWeb) {
      continue;
    }
    disconnectServer(server, true);
    addServerToNetwork(server, server.depth, server.leftOffset);
  }
  balanceDarknetServers();

  const updatedServers = getAllMovableDarknetServers();
  for (let i = 0; i < getNetDepth(); i++) {
    const server = updatedServers[Math.floor(Math.random() * updatedServers.length)];
    addGuaranteedConnection(server);
  }
};

export const addRandomConnections = (server: DarknetServer) => {
  if (isLabyrinthServer(server.hostname)) {
    return;
  }
  const x = server.depth;
  const y = server.leftOffset;
  const horizontalNeighbors = getNeighborsOnRow(x, y);
  const lateralConnectionChance = HORIZONTAL_CONNECTION_CHANCE * (1.1 - server.depth * 0.01);
  horizontalNeighbors.forEach((neighbor) => {
    if (Math.random() < lateralConnectionChance) {
      connectServers(server, neighbor);
    }
  });

  const serversAbove = getServersOnRowAbove(x);
  const serversBelow = getServersOnRowBelow(x);
  const verticalConnectionChance = VERTICAL_CONNECTION_CHANCE * (1.1 - server.depth * 0.01);
  [...serversAbove, ...serversBelow].forEach((neighbor) => {
    const distance = Math.abs(neighbor.depth ?? x - x) + 1;
    if (Math.random() < verticalConnectionChance / distance) {
      connectServers(server, neighbor);
    }
  });
};

export const addServerToNetwork = (server: DarknetServer, x: number, y: number) => {
  if (DarknetState.Network[x][y]?.hostname) {
    exceptionAlert(
      `Server already exists at this coordinate. Hostname: ${DarknetState.Network[x][y].hostname}. Coordinate: ${x}-${y}`,
      true,
    );
    return;
  }

  DarknetState.Network[x][y] = server;
  server.depth = x;
  server.leftOffset = y;

  addRandomConnections(server);
  addGuaranteedConnection(server);

  if (server.depth === 0) {
    const darkWebRoot = GetServer(SpecialServers.DarkWeb);
    if (darkWebRoot) {
      connectServers(server, darkWebRoot);
    }
  }
  const maxDepth = getNetDepth();
  if (server.depth === maxDepth - 1) {
    const labyrinth = getLabyrinthDetails().lab;
    if (labyrinth) {
      connectServers(server, labyrinth);
    }
  }
};

// Creates all the special servers for use at the bottom of the dark net
export const addLabyrinth = () => {
  const commonData: Omit<DarknetServerConstructorParams, "hostname" | "ip" | "password" | "requiredCharismaSkill"> = {
    maxRam: 128,
    modelId: ModelIds.labyrinth,
    staticPasswordHint: "You have discovered a dark, mysterious maze. Your footsteps echo eerily in the silence.",
    passwordHintData: "",
    difficulty: 10,
    depth: -1,
    leftOffset: -1,
    hasStasisLink: false,
    blockedRam: 0,
    logTrafficInterval: Number.MAX_SAFE_INTEGER,
    isStationary: true,
  };

  const hostname = getLabyrinthDetails().name;
  if (hostname) {
    const passwordSalt = Math.floor(Math.random() * 10000);
    const server = new DarknetServer({
      ...commonData,
      hostname: hostname,
      ip: createUniqueRandomIp(),
      password: `!!the:masterwork:of:daedalus<${passwordSalt}>!!`,
      requiredCharismaSkill: getLabyrinthChaRequirement(hostname),
    });
    AddToAllServers(server);
  }
};
