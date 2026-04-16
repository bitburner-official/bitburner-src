import { DarknetState } from "../models/DarknetState";
import { DarknetServer } from "../../Server/DarknetServer";
import { AIR_GAP_DEPTH, MS_PER_MUTATION_PER_ROW, NET_WIDTH } from "../Enums";
import { GetAllServers } from "../../Server/AllServers";
import { getNetDepth } from "../effects/labyrinth";
import { CONSTANTS } from "../../Constants";
import { Player } from "@player";

export const getDarknetCyclesPerMutation = () => {
  const depth = getNetDepth();
  const cycleRate = MS_PER_MUTATION_PER_ROW / CONSTANTS.MilliPerCycle;
  const rateMultiplier = Player.bitNodeN !== 15 ? 2 : 1;
  return (rateMultiplier * cycleRate) / depth;
};

export const getAllOpenPositions = (minDepth: number, maxDepth: number): [number, number][] => {
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

export const getNeighborsOnRow = (x: number, y: number): DarknetServer[] => {
  const neighbors: DarknetServer[] = [];
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

export const getAllDarknetServers = (): DarknetServer[] => {
  return GetAllServers(true).filter((server) => server instanceof DarknetServer);
};

export const getAllMovableDarknetServers = (): DarknetServer[] => {
  const movableDarknetServers = [];
  for (const server of GetAllServers(true)) {
    if (!(server instanceof DarknetServer) || server.isStationary || server.hasStasisLink) {
      continue;
    }
    movableDarknetServers.push(server);
  }
  return movableDarknetServers;
};

export const getAllAdjacentNeighbors = (x: number, y: number): DarknetServer[] => {
  const rowAbove = getServersOnRowAbove(x, true);
  const rowBelow = getServersOnRowBelow(x, true);
  const neighborsOnRow = getNeighborsOnRow(x, y);
  return [...rowAbove, ...rowBelow, ...neighborsOnRow];
};

export const getIslands = () => getAllMovableDarknetServers().filter((s) => !s.serversOnNetwork.length);

export const getBackdooredDarknetServers = (): DarknetServer[] =>
  getAllMovableDarknetServers().filter((s) => !s.hasStasisLink && s.backdoorInstalled);

export const getNearbyNonEmptyPasswordServer = (server: DarknetServer, disconnected = false) => {
  return getAllAdjacentNeighbors(server.depth, server.leftOffset).find(
    (neighbor) =>
      !neighbor.hasAdminRights &&
      neighbor.password &&
      (!disconnected || !server.serversOnNetwork.includes(neighbor.hostname)),
  );
};

export const getStasisLinkServers = () => getAllDarknetServers().filter((s) => s.hasStasisLink);

const isOnAirGap = (x: number): boolean => !!x && !(x % AIR_GAP_DEPTH);

const notNull = <T>(value: T | null): value is T => value !== null;
