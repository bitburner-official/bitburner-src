import { connectServers, DeleteServer, disconnectServers, GetServer } from "../../Server/AllServers";
import { DarknetEvents, DarknetState, getServerState, storeDarknetCycles } from "../models/DarknetState";
import { createDarknetServer } from "./ServerGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { addServerToNetwork, movePlayerIfNeeded } from "./NetworkGenerator";
import { killScripts } from "../../Netscript/killWorkerScript";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { getNetDepth, isLabyrinthServer } from "../effects/labyrinth";
import { NET_WIDTH, SERVER_DENSITY } from "../Enums";
import {
  getAllAdjacentNeighbors,
  getAllMobileDarknetServers,
  getAllOpenPositions,
  getBackdooredDarkwebServers,
  getDarknetCyclesPerMutation,
  getIslands,
} from "../utils/darknetNetworkUtils";
import { getDarknetData, isDarknetServer, isImmutable } from "../utils/darknetServerUtils";
import { DarknetConstants } from "../Constants";

export const processDarknet = (cycles: number) => {
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

export const mutateDarknet = () => {
  if (!DarknetState.allowMutating) {
    return;
  }
  const servers = getAllMobileDarknetServers();
  if (servers.length === 0) {
    return;
  }

  // Limit mutation speed based on size of net
  const depth = getNetDepth();
  const depthSpeedFactor = 12 / depth;
  if (Math.random() > depthSpeedFactor) {
    return;
  }

  if (Math.random() < 0.3) {
    const islands = getIslands();
    const island = islands[Math.floor(Math.random() * islands.length)];
    island && moveDarknetServer(island);
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
    const backdooredServers = getBackdooredDarkwebServers();
    const server = backdooredServers[Math.floor(Math.random() * backdooredServers.length)];
    if (server) {
      restartServer(server);
      return;
    }
  }

  if (Math.random() < 0.05) {
    const backdooredServers = getBackdooredDarkwebServers();
    const server = backdooredServers[Math.floor(Math.random() * backdooredServers.length)];
    if (server) {
      deleteDarknetServer(server);
      return;
    }
  }

  if (Math.random() < 0.2) {
    // restart a server
    const server = servers[Math.floor(Math.random() * servers.length)];
    restartServer(server);
  }

  if (Math.random() < 0.5) {
    moveRandomDarknetServers(3);
  }

  if (Math.random() < 0.5) {
    // add a couple connections
    const server2 = servers[Math.floor(Math.random() * servers.length)];
    addGuaranteedConnection(server2);
    addGuaranteedConnection(server2);
    return;
  }

  if (Math.random() < 0.5) {
    // delink all connections from a server
    const server3 = servers[Math.floor(Math.random() * servers.length)];
    disconnectServer(server3);
  }

  if (Math.random() < 0.1) {
    // balance network to stay at a certain density
    balanceDarknetServers();
  }
  sanitizeDarkwebNetwork();
};

export const restartAllDarknetServers = () => {
  const servers = getAllMobileDarknetServers();
  for (const server of servers) {
    restartServer(server);
  }
};

export const moveRandomDarknetServers = (count = 1) => {
  const servers = getAllMobileDarknetServers();
  for (let i = 0; i < count; i++) {
    const server = servers[Math.floor(Math.random() * servers.length)];
    moveDarknetServer(server);
  }
};

export const deleteRandomDarknetServers = (count = 1) => {
  for (let i = 0; i < count; i++) {
    const servers = getAllMobileDarknetServers().filter((server) => !isLabyrinthServer(server.hostname));
    const serverToDelete = servers[Math.floor(Math.random() * servers.length)];
    deleteDarknetServer(serverToDelete);
  }
  sanitizeDarkwebNetwork();
};

export const deleteDarknetServer = (server: BaseServer, force = false) => {
  if (!server || (isImmutable(server) && !force)) {
    return false;
  }
  const isLabyrinth = isLabyrinthServer(server.hostname);
  movePlayerIfNeeded(server);
  killScripts(server);
  disconnectServer(server, true);
  if (isDarknetServer(server) && DarknetState.Network[server.depth]?.[server.leftOffset]) {
    DarknetState.Network[server.depth][server.leftOffset] = null;
  }
  !isLabyrinth && DarknetState.offlineServers.push(server.hostname);
  DeleteServer(server.hostname);
};

export const addRandomDarknetServers = (count = 1, difficulty?: number) => {
  for (let i = 0; i < count; i++) {
    const diff = difficulty ?? Math.floor(Math.random() * getNetDepth());
    const newServer = createDarknetServer(diff, -1, -1);
    const success = moveDarknetServer(newServer);
    if (!success) {
      deleteDarknetServer(newServer);
    }
    if (DarknetState.offlineServers.includes(newServer.hostname)) {
      DarknetState.offlineServers = DarknetState.offlineServers.filter((s) => s !== newServer.hostname);
    }
  }
  sanitizeDarkwebNetwork();
};

export const balanceDarknetServers = () => {
  if (getAllMobileDarknetServers().length > getNetDepth() * NET_WIDTH * SERVER_DENSITY) {
    const serversToRemove = getAllMobileDarknetServers().length - getNetDepth() * NET_WIDTH * SERVER_DENSITY;
    deleteRandomDarknetServers(serversToRemove);
  } else {
    const serversToAdd = getNetDepth() * NET_WIDTH * SERVER_DENSITY - getAllMobileDarknetServers().length;
    addRandomDarknetServers(serversToAdd);
  }
};

export const moveDarknetServer = (server: BaseServer, maxDepthDecrease = 3, maxDepthIncrease = 3) => {
  const darknetData = getDarknetData(server);
  if (!server || !darknetData || isImmutable(server)) {
    // Do not try to move the server that is open in the UI or the terminal
    return false;
  }

  const positionOptions = getAllOpenPositions(
    darknetData.difficulty - maxDepthDecrease,
    darknetData.difficulty + maxDepthIncrease,
  );
  if (positionOptions.length === 0) {
    return false;
  }

  const [newX, newY] = positionOptions[Math.floor(Math.random() * positionOptions.length)];
  disconnectServer(server, true);

  if (DarknetState.Network[darknetData.depth]?.[darknetData.leftOffset]) {
    DarknetState.Network[darknetData.depth][darknetData.leftOffset] = null;
  }
  addServerToNetwork(server, newX, newY);
  return true;
};

export const disconnectServer = (server: BaseServer, disconnectDarkweb = false) => {
  if (isImmutable(server)) {
    return false;
  }
  server.serversOnNetwork.forEach((conn) => {
    const connectedServer = GetServer(conn);
    const isOkToDisconnect = disconnectDarkweb || connectedServer?.hostname !== SpecialServers.DarkWeb;
    if (connectedServer && isOkToDisconnect) {
      disconnectServers(server, connectedServer);
    }
  });
};

export const restartServer = (server: BaseServer) => {
  if (!isDarknetServer(server) || isImmutable(server)) {
    return false;
  }
  killScripts(server);
  const serverState = getServerState(server.hostname);
  serverState.authenticatedPIDs = [];
  server.backdoorInstalled = false;
  disconnectServer(server);
  addGuaranteedConnection(server);
  addGuaranteedConnection(server);
};

export const addGuaranteedConnection = (server: BaseServer) => {
  const darknetData = getDarknetData(server);
  if (!darknetData || isLabyrinthServer(server.hostname)) {
    return;
  }

  const neighbors = getAllAdjacentNeighbors(darknetData.depth ?? 0, darknetData.leftOffset ?? 0);
  if (neighbors.length === 0) {
    return;
  }
  const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
  connectServers(server, neighbor);
};

export const sanitizeDarkwebNetwork = () => {
  const darkweb = GetServer(SpecialServers.DarkWeb);
  if (!darkweb) {
    return;
  }
  const servers = [...getAllMobileDarknetServers(), darkweb];
  for (const server of servers) {
    const darknetData = getDarknetData(server);
    if (!GetServer(server.hostname) && DarknetState.Network[darknetData?.depth ?? -1]) {
      DarknetState.Network[darknetData?.depth ?? 0][darknetData?.leftOffset ?? 0] = null;
      disconnectServer(server, true);
      deleteDarknetServer(server);
      continue;
    }

    for (const conn of server.serversOnNetwork) {
      const connection = GetServer(conn);
      if (!connection) {
        server.serversOnNetwork = server.serversOnNetwork.filter((c) => c !== conn);
        continue;
      }
      if (!connection.serversOnNetwork.includes(server.hostname)) {
        server.serversOnNetwork = server.serversOnNetwork.filter((c) => c !== connection.hostname);
      }
    }

    if (darknetData?.depth === 0 && darkweb) {
      connectServers(server, darkweb);
    }
  }
  DarknetEvents.emit();
};
