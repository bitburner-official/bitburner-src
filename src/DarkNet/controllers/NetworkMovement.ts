import { connectServers, DeleteServer, disconnectServers, GetAllServers, GetServer } from "../../Server/AllServers";
import {
  DarknetEvents,
  DarknetState,
  getServerState,
  storeDarknetCycles,
} from "../models/DarknetState";
import { createDarknetServer } from "./ServerGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { addServerToNetwork, movePlayerIfNeeded } from "./NetworkGenerator";
import { killScripts } from "../../Netscript/killWorkerScript";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { getNetDepth, isLabyrinthServer } from "../effects/labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";
import { getDarknetData, isDarknetServer } from "../effects/effects";
import { CONSTANTS } from "../../Constants";
import { AIR_GAP_DEPTH, MS_PER_MUTATION_PER_ROW, NET_WIDTH, SERVER_DENSITY } from "../Enums";

export const processDarknet = (cycles: number) => {
  storeDarknetCycles(cycles);
  const cyclesPerUpdate = getDarknetCyclesPerMutation();

  if (DarknetState.cyclesSinceLastMutation > cyclesPerUpdate) {
    DarknetState.storedCycles = Math.max(0, DarknetState.storedCycles - cyclesPerUpdate * 3);
    DarknetState.cyclesSinceLastMutation = 0;
    mutateDarknet();
  }
};

export const getDarknetCyclesPerMutation = () => {
  const depth = getNetDepth();
  const cycleRate = MS_PER_MUTATION_PER_ROW / CONSTANTS.MilliPerCycle;
  return cycleRate / depth;
};

export const mutateDarknet = () => {
  if (!DarknetState.isMutating) {
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

const getAllOpenPositions = (minDepth: number, maxDepth: number): [number, number][] => {
  const min = Math.max(0, minDepth);
  const max = Math.min(maxDepth, getNetDepth() - 1);
  const positions: [number, number][] = [];
  for (let x = min; x <= max; x++) {
    for (let y = 0; y < NET_WIDTH; y++) {
      if (DarknetState.Network[x] && !DarknetState.Network[x][y] && !isOnAirGap(x)) {
        positions.push([x, y]);
      }
    }
  }
  if (min === 0 && max === getNetDepth() - 1) {
    return positions;
  }
  if (positions.length === 0) {
    return getAllOpenPositions(min - 1, max + 1);
  }
  return positions;
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

export const getNeighborsOnRow = (x: number, y: number): BaseServer[] => {
  const neighbors: BaseServer[] = [];
  const leftNeighbor = DarknetState.Network[x]?.[y - 1];
  const rightNeighbor = DarknetState.Network[x]?.[y + 1];
  if (leftNeighbor) {
    neighbors.push(leftNeighbor);
  }
  if (rightNeighbor) {
    neighbors.push(rightNeighbor);
  }
  return neighbors;
};

export const getServersOnRowBelow = (x: number, close = false): DarknetServer[] => {
  const rowBelow = DarknetState.Network[x - 1]?.filter(notNull<DarknetServer>) ?? [];
  if (close) {
    return rowBelow.filter((server) => Math.abs(server.leftOffset ?? 0 - x) <= 1);
  }
  return rowBelow;
};

export const getServersOnRowAbove = (x: number, close = false): DarknetServer[] => {
  const rowAbove = DarknetState.Network[x + 1]?.filter(notNull<DarknetServer>) ?? [];
  if (close) {
    return rowAbove.filter((server) => Math.abs(server.leftOffset ?? 0 - x) <= 1);
  }
  return rowAbove;
};

/**
 */
export const getAllMobileDarknetServers = (): DarknetServer[] => {
  return GetAllServers(true)
    .filter(isDarknetServer)
    .filter((s) => s.isMobile);
};

export const getAllAdjacentNeighbors = (x: number, y: number): BaseServer[] => {
  const rowAbove = getServersOnRowAbove(x, true);
  const rowBelow = getServersOnRowBelow(x, true);
  const neighborsOnRow = getNeighborsOnRow(x, y);
  return [...rowAbove, ...rowBelow, ...neighborsOnRow];
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

export const getBackdooredDarkwebServers = (): BaseServer[] =>
  getAllMobileDarknetServers().filter((s) => !s.hasStasisLink && s.backdoorInstalled);

const isOnAirGap = (x: number): boolean => !!x && !(x % AIR_GAP_DEPTH);

const notNull = <T>(value: T | null): value is T => value !== null;

const isImmutable = (server?: BaseServer | null) =>
  !server ||
  !isDarknetServer(server) ||
  server === DarknetState.openServer ||
  server.isConnectedTo ||
  server.hasStasisLink;

const getIslands = () => getAllMobileDarknetServers().filter((s) => !s.serversOnNetwork.length);

/**
 * WIP-@fico: both this TS file and effects.ts contain many utility functions. getDarknetServerSafely is here, but
 * getDarknetData is in effects.ts. isDarknetServer is also in effects.ts. I also created GetDarknetServerOrThrow in
 * AllServers.ts. It looks a bit promiscuous.
 */
export const getDarknetServerSafely = (hostnameOrIp: string): DarknetServer | null => {
  const server = GetServer(hostnameOrIp);
  if (!server || !isDarknetServer(server)) {
    return null;
  }
  return server;
};
