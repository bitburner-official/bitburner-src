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
import { Icon, labIcon } from "../ui/ServerIcon";
import { Player } from "@player";
import { Terminal } from "../../Terminal";
import {
  getLabyrinthChaiRequirement,
  getLabyrinthDetails,
  getLabyrinthServerNames,
  getNetDepth,
  isLabyrinthServer,
} from "../effects/labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";
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
  getAllMobileDarknetServers,
  getNeighborsOnRow,
  getServersOnRowAbove,
  getServersOnRowBelow,
} from "../utils/darknetNetworkUtils";
import { getDarknetServerSafely } from "../utils/darknetServerUtils";

// WIP: This may be the wrong way to migrate darkweb server
/**
 * Creates the dark web server if it does not already exist, or returns the existing one if it does.
 * If the current darkweb server is a standard server, it will be deleted and replaced with a darknet server.
 */
export const GetOrCreateDarkwebServer = (): DarknetServer => {
  const existingServer = GetServer(SpecialServers.DarkWeb);
  if (existingServer instanceof DarknetServer) {
    return existingServer;
  } else if (existingServer) {
    // Remove legacy darkweb server, so it can be made into a darknet server
    disconnectServers(existingServer, Player.getHomeComputer());
    DeleteServer(existingServer.hostname);
  }

  const data: DarknetServerOptions = {
    icon: Icon.Terminal,
    password: "leekspin",
    modelId: ModelIds.EchoVuln,
    staticPasswordHint: "The passkey is 'leekspin'",
    passwordHintData: "leekspin",
    leftOffset: -1,
    depth: -1,
    difficulty: 0,
  };

  const darkweb = DnetServerBuilder(data, SpecialServers.DarkWeb);
  darkweb.isMobile = false;
  darkweb.hasAdminRights = true;
  darkweb.ramBlock = 0;

  return darkweb;
};

export const populateDarknet = () => {
  GetOrCreateDarkwebServer();

  if (getAllMobileDarknetServers().length) {
    loadDarknet();
    return;
  }

  clearDarknet(true);
  addLabyrinth();
  addRandomDarknetServers(getNetDepth() * NET_WIDTH * SERVER_DENSITY - 10);
  addRandomDarknetServers(5 - DarknetState.Network[0].length);
  addRandomDarknetServers(5 - DarknetState.Network[1].length);
  balanceDarknetServers();

  const updatedServers = getAllMobileDarknetServers();
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
      deleteDarknetServer(server, force);
      DarknetState.Network[i][j] = null;
    }
  }
  const darkwebRoot = GetServer(SpecialServers.DarkWeb);
  if (darkwebRoot) {
    darkwebRoot.serversOnNetwork = [Player.getHomeComputer().hostname];
  }

  for (const lab of getLabyrinthServerNames()) {
    const labyrinth = getDarknetServerSafely(lab);
    if (!labyrinth) continue;
    deleteDarknetServer(labyrinth);
  }
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
  const currentServers = DarknetState.Network.flat().filter((s) => s !== null && s.isMobile);
  if (currentServers.length) {
    return;
  }

  const darkNetServers = getAllMobileDarknetServers();
  for (const server of darkNetServers) {
    if (isLabyrinthServer(server.hostname)) {
      continue;
    }
    disconnectServer(server, true);
    addServerToNetwork(server, server.depth, server.leftOffset);
  }
  balanceDarknetServers();

  const updatedServers = getAllMobileDarknetServers();
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
  horizontalNeighbors.forEach((neighbor) => {
    if (Math.random() < HORIZONTAL_CONNECTION_CHANCE) {
      connectServers(server, neighbor);
    }
  });

  const serversAbove = getServersOnRowAbove(x);
  const serversBelow = getServersOnRowBelow(x);
  [...serversAbove, ...serversBelow].forEach((neighbor) => {
    const distance = Math.abs(neighbor.depth ?? x - x) + 1;
    if (Math.random() < VERTICAL_CONNECTION_CHANCE / distance) {
      connectServers(server, neighbor);
    }
  });
};

export const addServerToNetwork = (server: DarknetServer, x: number, y: number) => {
  // WIP: Delete this check. If it happens, let it crash.
  if (DarknetState.Network[x]?.[y] === undefined) {
    console.error(`Invalid coordinate: ${x}-${y}`);
    return;
  }
  if (DarknetState.Network[x][y]?.hostname) {
    // WIP: Use exceptionAlert
    console.error(
      `Server already exists at this coordinate. Hostname: ${DarknetState.Network[x][y].hostname}. Coordinate: ${x}-${y}`,
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
  const passwordSalt = Math.floor(Math.random() * 10000);
  const darknetData = {
    icon: labIcon,
    password: `!!the:masterwork:of:daedalus<${passwordSalt}>!!`,
    staticPasswordHint: "You have discovered a dark, mysterious maze. Your footsteps echo eerily in the silence.",
    passwordHintData: "",
    modelId: ModelIds.labyrinth,
    difficulty: 10,
    depth: -1,
    leftOffset: -1,
    hasStasisLink: false,
    ramBlock: 0,
    logTrafficInterval: Number.MAX_SAFE_INTEGER,
    requiredCharismaSkill: 0,
  };

  const params = {
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    maxRam: 128,
    hackDifficulty: 10,
    moneyAvailable: 0,
    numOpenPortsRequired: 69,
    adminRights: false,
    ...darknetData,
  };

  for (const hostname of getLabyrinthServerNames()) {
    const cha = getLabyrinthChaiRequirement(hostname);
    const server = new DarknetServer({
      ...params,
      isOnline: true,
      requiredCharismaSkill: cha,
      hostname: hostname,
      hasAdminRights: false,
      isConnectedTo: false,
      purchasedByPlayer: false,
      ramUsed: 0,
      isMobile: false,
    });
    AddToAllServers(server);
  }
};
