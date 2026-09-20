import { connectServers, DeleteServer, disconnectServers, GetServer, GetServerOrThrow } from "../../Server/AllServers";
import {
  DarknetEvents,
  DarknetState,
  getServerState,
  storeDarknetCycles,
  triggerNextUpdate,
} from "../models/DarknetState";
import { createDarknetServer } from "./ServerGenerator";
import { addServerToNetwork, movePlayerIfNeeded } from "./NetworkGenerator";
import { killServerScripts } from "../../Netscript/killWorkerScript";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { getNetDepth, isLabyrinthServer } from "../effects/labyrinth";
import { LOW_LEVEL_SERVER_DENSITY, MAX_NET_DEPTH, NET_WIDTH, SERVER_DENSITY } from "../Enums";
import {
  getAllAdjacentNeighbors,
  getAllDarknetServers,
  getAllMovableDarknetServers,
  getAllOpenPositions,
  getBackdooredDarknetServers,
  getDarknetCyclesPerMutation,
  getIslands,
} from "../utils/darknetNetworkUtils";
import { DarknetConstants } from "../Constants";
import type { DarknetServer } from "../../Server/DarknetServer";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

export const processDarknet = (cycles: number): void => {
  storeDarknetCycles(cycles);

  if (DarknetState.storedCycles < DarknetConstants.MinCyclesToProcess) {
    return;
  }

  const cyclesToProcess = Math.min(DarknetState.storedCycles, DarknetConstants.MaxCyclesToProcess);
  DarknetState.storedCycles -= cyclesToProcess;

  const cyclesPerMutation = getDarknetCyclesPerMutation();
  if (DarknetState.cyclesSinceLastMutation > cyclesPerMutation) {
    DarknetState.cyclesSinceLastMutation = 0;
    mutateDarknet();
  }
};

export const mutateDarknet = (): void => {
  if (DarknetState.mutationLock) {
    return;
  }
  const servers = getAllMovableDarknetServers();
  if (servers.length === 0) {
    return;
  }

  // resolve pending update promise, and create a new one
  triggerNextUpdate();

  // Limit mutation speed based on size of net
  const depth = getNetDepth();
  const depthSpeedFactor = 16 / depth;
  if (Math.random() > depthSpeedFactor) {
    return;
  }

  if (Math.random() < 0.3) {
    const islands = getIslands();
    const island = islands[Math.floor(Math.random() * islands.length)];
    if (island) {
      moveDarknetServer(island);
    }
  }

  if (Math.random() < 0.3) {
    // Ensure good density of low level servers for early progression
    addLowLevelServersIfNeeded();
  }

  if (Math.random() < 0.1) {
    // remove some servers
    deleteRandomDarknetServers(Math.random() * 3 + 1);
  }

  if (Math.random() < 0.1) {
    // Add some servers
    const serversToAdd = Math.random() * 3 + 1;
    for (let i = 0; i < serversToAdd; i++) {
      addRandomDarknetServers();
    }
    return;
  }

  if (Math.random() < 0.1) {
    const backdooredServers = getBackdooredDarknetServers();
    const server = backdooredServers[Math.floor(Math.random() * backdooredServers.length)];
    if (server) {
      restartServer(server);
      return;
    }
  }

  if (Math.random() < 0.05) {
    const backdooredServers = getBackdooredDarknetServers();
    const server = backdooredServers[Math.floor(Math.random() * backdooredServers.length)];
    if (server) {
      deleteDarknetServer(server);
      return;
    }
  }

  if (Math.random() < 0.2) {
    // restart a server
    restartRandomServer();
  }

  if (Math.random() < 0.3) {
    moveRandomDarknetServers(3);
  }

  if (Math.random() < 0.5) {
    addConnectionsToRandomServer();
    return;
  }

  if (Math.random() < 0.5) {
    // unlink all connections from a server
    disconnectRandomServer();
  }

  if (Math.random() < 0.1) {
    // balance network to stay at a certain density
    balanceDarknetServers();
  }
  validateDarknetNetwork();
  DarknetEvents.emit();
};

export const restartAllDarknetServers = (): void => {
  const servers = getAllMovableDarknetServers();
  for (const server of servers) {
    restartServer(server);
  }
};

export const moveRandomDarknetServers = (count = 1): void => {
  for (let i = 0; i < count; i++) {
    const servers = getAllMovableDarknetServers();
    if (servers.length === 0) {
      break;
    }
    const server = servers[Math.floor(Math.random() * servers.length)];
    moveDarknetServer(server);
  }
};

export const deleteRandomDarknetServers = (count = 1): void => {
  for (let i = 0; i < count; i++) {
    const servers = getAllMovableDarknetServers();
    if (servers.length === 0) {
      break;
    }
    const serverToDelete = servers[Math.floor(Math.random() * servers.length)];
    deleteDarknetServer(serverToDelete);
  }
};

export const deleteDarknetServer = (server: DarknetServer, force = false): void => {
  if (server.hostname === SpecialServers.DarkWeb) {
    exceptionAlert(new Error("Something is trying to delete darkweb"), true);
    return;
  }
  if (isImmutable(server) && !force) {
    return;
  }
  const isLabyrinth = isLabyrinthServer(server.hostname);
  movePlayerIfNeeded(server);
  killServerScripts(server, "Server shut down.");
  disconnectServer(server, true);
  if (DarknetState.Network[server.depth]?.[server.leftOffset]) {
    DarknetState.Network[server.depth][server.leftOffset] = null;
  }
  if (!isLabyrinth) {
    // Adding the ip first is an optimization to improve the random distribution
    // of reused hostnames slightly. See the comment in generateDarknetServerName.
    DarknetState.offlineServers.add(server.ip);
    DarknetState.offlineServers.add(server.hostname);
  }
  DeleteServer(server.hostname);
  const serverState = getServerState(server.hostname);
  serverState.authenticatedPIDs = [];
  serverState.serverLogs.length = 0;
};

export const addRandomDarknetServers = (count = 1, difficulty?: number, fixedDepth?: boolean): void => {
  for (let i = 0; i < count; i++) {
    const diff = difficulty ?? Math.floor(Math.random() * getNetDepth());
    const newServer = createDarknetServer(diff, -1, -1);
    const range = fixedDepth ? 0 : 3;
    moveDarknetServer(newServer, range, range);
  }
};

export const addLowLevelServersIfNeeded = (): void => {
  const lowLevelServers = getAllDarknetServers().filter((s) => s.depth <= 3);
  const serversConnectedToDarkweb = getAllDarknetServers().filter((s) => s.depth === 0);
  if (serversConnectedToDarkweb.length <= 3) {
    addRandomDarknetServers(2, 0, true);
    addLowLevelServersIfNeeded();
  }
  if (lowLevelServers.length / (4 * NET_WIDTH) < LOW_LEVEL_SERVER_DENSITY) {
    addRandomDarknetServers(2, Math.floor(Math.random() * 4));
    addLowLevelServersIfNeeded();
  }
};

export const balanceDarknetServers = (): void => {
  const movableServers = getAllMovableDarknetServers();
  const netDepth = getNetDepth();
  if (movableServers.length > netDepth * NET_WIDTH * SERVER_DENSITY) {
    const serversToRemove = movableServers.length - netDepth * NET_WIDTH * SERVER_DENSITY;
    deleteRandomDarknetServers(serversToRemove);
  } else {
    const serversToAdd = netDepth * NET_WIDTH * SERVER_DENSITY - movableServers.length;
    addRandomDarknetServers(serversToAdd);
  }
  addLowLevelServersIfNeeded();
};

const isImmutable = (server: DarknetServer): boolean =>
  server === DarknetState.openServer || server.isConnectedTo || server.hasStasisLink || !server.maxRam;

export const moveDarknetServer = (
  server: DarknetServer,
  maxDepthDecrease = 3,
  maxDepthIncrease = 3,
  startingDepth = server.difficulty,
): boolean => {
  if (server.hostname === SpecialServers.DarkWeb) {
    exceptionAlert(new Error("Something is trying to move darkweb"), true);
    return false;
  }
  if (isImmutable(server)) {
    // Do not try to move the server that is frozen, stasis locked, or open in the UI or the terminal
    return false;
  }

  const positionOptions = getAllOpenPositions(startingDepth - maxDepthDecrease, startingDepth + maxDepthIncrease);
  if (positionOptions.length === 0) {
    // If server cannot be moved, do not leave it disconnected and floating
    deleteDarknetServer(server);
    return false;
  }

  const [newX, newY] = positionOptions[Math.floor(Math.random() * positionOptions.length)];
  disconnectServer(server, true);

  if (DarknetState.Network[server.depth]?.[server.leftOffset]) {
    DarknetState.Network[server.depth][server.leftOffset] = null;
  }
  addServerToNetwork(server, newX, newY);
  return true;
};

const disconnectRandomServer = (): void => {
  const servers = getAllMovableDarknetServers();
  if (servers.length === 0) {
    return;
  }
  const server = servers[Math.floor(Math.random() * servers.length)];
  disconnectServer(server);
};

/**
 * By default, this function disconnects the specified server from its neighbors, unless the neighbor is darkweb or a
 * labyrinth server. Use the second parameter to ignore the exception.
 * We added this exception to improve the stability of the servers directly connected to darkweb or labyrinth servers.
 */
export const disconnectServer = (server: DarknetServer, force = false): void => {
  if (server.hostname === SpecialServers.DarkWeb) {
    exceptionAlert(new Error("Something is trying to disconnect darkweb"), true);
    return;
  }
  if (isImmutable(server) && !force) {
    return;
  }
  for (const neighbor of server.serversOnNetwork) {
    const connectedServer = GetServerOrThrow(neighbor);
    const isOkToDisconnect =
      force || (connectedServer.hostname !== SpecialServers.DarkWeb && !isLabyrinthServer(neighbor));
    if (connectedServer && isOkToDisconnect) {
      disconnectServers(server, connectedServer);
    }
  }
};

const restartRandomServer = (): void => {
  const servers = getAllMovableDarknetServers();
  if (servers.length === 0) {
    return;
  }
  restartServer(servers[Math.floor(Math.random() * servers.length)]);
};

export const restartServer = (server: DarknetServer): void => {
  if (isImmutable(server)) {
    return;
  }
  killServerScripts(server, "Server restarted.");
  const serverState = getServerState(server.hostname);
  serverState.authenticatedPIDs = [];
  serverState.serverLogs.length = 0;
  serverState.serverLogs.push({ pid: -1, message: "Server restarting, terminating scripts..." });
  server.backdoorInstalled = false;
  disconnectServer(server);
  addGuaranteedConnection(server);
};

const addConnectionsToRandomServer = (): void => {
  const servers = getAllMovableDarknetServers();
  if (servers.length === 0) {
    return;
  }
  const server = servers[Math.floor(Math.random() * servers.length)];
  addGuaranteedConnection(server);
};

export const addGuaranteedConnection = (server: DarknetServer): void => {
  if (isLabyrinthServer(server.hostname)) {
    return;
  }

  const neighbors = getAllAdjacentNeighbors(server.depth, server.leftOffset);
  if (neighbors.length === 0) {
    return;
  }
  const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
  connectServers(server, neighbor);
};

export const validateDarknetNetwork = (): void => {
  const servers = getAllDarknetServers();
  // The darknet should have at least darkweb and labyrinth servers.
  if (servers.length < 2) {
    exceptionAlert(new Error(`There are too few darknet servers. servers.length: ${servers.length}`), true);
  }
  for (const server of servers) {
    if (server.depth !== -1 && DarknetState.Network[server.depth]?.[server.leftOffset]?.hostname !== server.hostname) {
      exceptionAlert(
        new Error(
          `${server.hostname} does not exist in DarknetState.Network at [${server.depth}][${server.leftOffset}]`,
        ),
        true,
      );
    }
    for (const neighborHostname of server.serversOnNetwork) {
      const neighbor = GetServer(neighborHostname);
      if (!neighbor) {
        exceptionAlert(
          new Error(
            `Found invalid neighbor dnet server. hostname: ${server.hostname}. neighbor: ${neighborHostname}. ` +
              `serversOnNetwork: ${server.serversOnNetwork}`,
          ),
          true,
        );
        continue;
      }
      if (!neighbor.serversOnNetwork.includes(server.hostname)) {
        exceptionAlert(
          new Error(
            `The connection between ${server.hostname} and ${neighbor.hostname} is unidirectional. ` +
              `server.serversOnNetwork: ${server.serversOnNetwork}. neighbor.serversOnNetwork: ${neighbor.serversOnNetwork}`,
          ),
          true,
        );
      }
    }
    if (server.depth === 0 && !server.serversOnNetwork.includes(SpecialServers.DarkWeb)) {
      exceptionAlert(
        new Error(
          `${server.hostname} at depth 0 does not have a connection to ${SpecialServers.DarkWeb}. ` +
            `server.serversOnNetwork: ${server.serversOnNetwork}`,
        ),
        true,
      );
    }
  }
  for (let i = 0; i < MAX_NET_DEPTH; i++) {
    for (let j = 0; j < NET_WIDTH; j++) {
      const serverInNetwork = DarknetState.Network[i]?.[j];
      if (!serverInNetwork) {
        continue;
      }
      const server = GetServer(serverInNetwork.hostname);
      if (server == null) {
        exceptionAlert(new Error(`${serverInNetwork.hostname} at [${i}][${j}] does not exist in AllServers`), true);
      }
      if (serverInNetwork !== server) {
        exceptionAlert(new Error(`Invalid darknet server instance detected at [${i}][${j}]`), true);
      }
    }
  }
};

export const freezeServer = (server: DarknetServer): void => {
  killServerScripts(server, "Server was frozen.");
  server.maxRam = 0;
  server.blockedRam = 0;
  // When blockedRam is non-zero, server.ramUsed is equal to blockedRam. When scripts are running, server.ramUsed is
  // equal to totalRAMCost + blockedRam. After all scripts are killed, server.ramUsed resets to blockedRam.
  // When a server is frozen, its maxRam is 0, so blockedRam should naturally also be 0. Therefore, we need to manually
  // set ramUsed to 0.
  server.updateRamUsed(0);
  server.isStationary = true;
};
