export const DarknetConstants = {
  MinCyclesToProcess: 1,
  MaxCyclesToProcess: 3,
  DataFileSuffix: ".data.txt",
  /** Discounted price when buying in Shadowed Walkway */
  DarkscapeNavigatorDiscountedPrice: 30e6,
  /** Standard price when buying via darkweb */
  DarkscapeNavigatorPrice: 50e6,
} as const;

export const MAX_PASSWORD_LENGTH = 50;
export const VERTICAL_CONNECTION_CHANCE = 0.3;
export const AIR_GAP_DEPTH = 8;
export const NET_WIDTH = 8;
export const MAX_NET_DEPTH = 100;
export const SERVER_DENSITY = 0.6;
export const LOW_LEVEL_SERVER_DENSITY = 0.7;
export const MS_PER_MUTATION_PER_ROW = 30_000; // 30 seconds
export const MAXIMUM_DNET_SERVER_COUNT = 120;
export const MAXIMUM_DIFFICULTY = 36;
export const MAX_MAZE_BONUS_SIZE = 50;
