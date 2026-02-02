import { PasswordResponse } from "../models/DarknetServerOptions";
import { addSessionToServer, DarknetState } from "../models/DarknetState";
import { calculatePasswordAttemptChaGain, hasFullDarknetAccess } from "./effects";
import { Player } from "@player";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { AugmentationName } from "@enums";
import type { DarknetServer } from "../../Server/DarknetServer";
import { getBitNodeMultipliers } from "../../BitNode/BitNode";
import { ResponseCodeEnum } from "../Enums";
import { addCacheToServer } from "./cacheFiles";
import { getDarknetServer } from "../utils/darknetServerUtils";
import { getFriendlyType, TypeAssertionError } from "../../utils/TypeAssertion";

export const LAB_CACHE_NAME = "the_great_work";

const NORTH = [0, -1];
const EAST = [1, 0];
const SOUTH = [0, 1];
const WEST = [-1, 0];

const WALL = "█";
const PATH = " ";

const MULTI_MAZE_THRESHOLD = 5;

type labDetails = {
  name: string;
  depth: number;
  cha: number;
  mazeWidth: number;
  mazeHeight: number;
  manual: boolean;
};

export const labData: Record<string, labDetails> = {
  [SpecialServers.NormalLab]: {
    name: SpecialServers.NormalLab,
    depth: 7,
    cha: 300,
    mazeWidth: 20,
    mazeHeight: 14,
    manual: true,
  },
  [SpecialServers.CruelLab]: {
    name: SpecialServers.CruelLab,
    depth: 12,
    cha: 600,
    mazeWidth: 30,
    mazeHeight: 20,
    manual: true,
  },
  [SpecialServers.MercilessLab]: {
    name: SpecialServers.MercilessLab,
    depth: 19,
    cha: 1500,
    mazeWidth: 40,
    mazeHeight: 26,
    manual: false,
  },
  [SpecialServers.UberLab]: {
    name: SpecialServers.UberLab,
    depth: 23,
    cha: 2500,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
  [SpecialServers.EternalLab]: {
    name: SpecialServers.EternalLab,
    depth: 29,
    cha: 2800,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
  [SpecialServers.FinalLab]: {
    name: SpecialServers.FinalLab,
    depth: 31,
    cha: 3200,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
  [SpecialServers.BonusLab]: {
    name: SpecialServers.BonusLab,
    depth: 31,
    cha: 3200,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
} as const;

/**
 * Generates a maze using the stack-based iterative backtracking algorithm.
 * This builds the maze by moving in random directions, removing walls as it goes through unvisited nodes.
 * If it hits a dead end with only visited nodes, it backtracks to the last node with unvisited neighbors.
 * @param width - the width of the maze
 * @param height - the height of the maze
 * @returns a 2D char array representing the maze, where "█" is a wall, " " is a path, "S" is the start, and "E" is the end
 */
export const generateMaze = (width: number = 41, height: number = 29): string[] => {
  // Make a simple maze below the threshold
  if (width < MULTI_MAZE_THRESHOLD) {
    return mazeMaker(width, height).map((row) => row.join(""));
  }

  // Stitch together 4 mazes for more interesting geometry

  const halfWidth = Math.ceil(width / 2);
  const halfHeight = Math.ceil(height / 2);

  // BAbove the threshold, join together 4 mazes and make some breaks in the walls
  const maze1 = mazeMaker(halfWidth, halfHeight);
  const maze2 = mazeMaker(halfWidth, halfHeight);
  const maze3 = mazeMaker(halfWidth, halfHeight);
  const maze4 = mazeMaker(halfWidth, halfHeight);

  const resultingMazeTopHalf = maze1.map((row, y) => row.slice(0, -1).concat(maze2[y]));
  const resultingMazeBottomHalf = maze3.map((row, y) => row.slice(0, -1).concat(maze4[y]));
  const resultingMaze = resultingMazeTopHalf.slice(0, -1).concat(resultingMazeBottomHalf);

  const subWidth = maze1[0].length - 1;
  const subHeight = maze1.length - 1;

  // Add gaps in the walls between the mazes
  const randomTopGap = Math.floor((Math.random() * halfWidth) / 4) * 2 + 1;
  resultingMaze[randomTopGap][subWidth] = PATH;

  const randomLeftGap = Math.floor((Math.random() * halfHeight) / 4) * 2 + 1;
  resultingMaze[subHeight][randomLeftGap] = PATH;

  const randomBottomGap = (Math.floor((Math.random() * halfWidth) / 4) + 1) * 2;
  resultingMaze[height - randomBottomGap - 1][subWidth] = PATH;

  const randomRightGap = (Math.floor((Math.random() * halfHeight) / 4) + 1) * 2;
  resultingMaze[subHeight][width - randomRightGap - 1] = PATH;

  return resultingMaze.map((row) => row.join(""));
};

const mazeMaker = (setWidth: number, setHeight: number): string[][] => {
  const width = setWidth % 2 === 0 ? setWidth + 1 : setWidth;
  const height = setHeight % 2 === 0 ? setHeight + 1 : setHeight;
  const maze: string[][] = Array.from({ length: height }, () => Array<string>(width).fill(WALL));
  const stack: [number, number][] = [];
  stack.push([1, 1]);
  const directions = [NORTH, EAST, SOUTH, WEST];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node?.[0] || !node[1]) throw new Error("Invalid stack pop");
    const [x, y] = node;

    const neighbors = directions
      .map(([dx, dy]) => [x + dx * 2, y + dy * 2])
      .filter(([nx, ny]) => nx > 0 && nx < width && ny > 0 && ny < height && maze[ny][nx] === WALL);

    if (neighbors.length > 0) {
      stack.push([x, y]);
      const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[(y + ny) / 2][(x + nx) / 2] = PATH;
      maze[ny][nx] = PATH;
      stack.push([nx, ny]);
    }
  }

  return maze;
};

export const getSurroundingsVisualized = (
  maze: string[],
  x: number,
  y: number,
  range = 1,
  showPlayer = false,
  showEnd = false,
): string => {
  const result: string[] = [];
  for (let i = y - range; i <= y + range; i++) {
    let row = "";
    for (let j = x - range; j <= x + range; j++) {
      if (i === y && j === x && showPlayer) {
        row += "@";
        continue;
      }
      if (i === maze.length - 2 && j === maze[0].length - 2 && showEnd) {
        row += "X";
        continue;
      }
      row += maze[i]?.[j] ?? PATH;
    }
    result.push(row);
  }

  return result.join("\n");
};

export const getLocationStatus = (pid: number = -1): LocationStatus => {
  const [initialX, initialY] = DarknetState.labLocations[pid] ?? [1, 1];
  const surroundings = getSurroundingsVisualized(getLabMaze(), initialX, initialY).split("\n");
  return {
    coords: [initialX, initialY],
    north: surroundings[0][1] === PATH,
    east: surroundings[1][2] === PATH,
    south: surroundings[2][1] === PATH,
    west: surroundings[1][0] === PATH,
    success: true,
  };
};

export const handleLabyrinthPassword = (
  attemptedPassword: string,
  server: DarknetServer,
  pid: number,
): PasswordResponse => {
  const labDetails = getLabyrinthDetails();

  if (Player.skills.charisma < labDetails.cha) {
    const failureMessages = [
      `You find yourself lost and confused. You need to be more charismatic to navigate the labyrinth.`,
      `You stumble in the dark. You need more moxie to find your way.`,
      `You feel the walls closing in. You need to be more charming to escape.`,
      `You are unable to make any progress. You need more charisma to find the secret.`,
    ];
    return {
      passwordAttempted: attemptedPassword,
      code: ResponseCodeEnum.NotEnoughCharisma,
      message: failureMessages[Math.floor(Math.random() * failureMessages.length)],
    };
  }

  const maze = getLabMaze();
  if (!DarknetState.labLocations[pid]) {
    DarknetState.labLocations[pid] = [1, 1];
  }
  const [initialX, initialY] = DarknetState.labLocations[pid];
  const end = [maze[0].length - 2, maze.length - 2];
  const [dx, dy] = getDirectionFromInput(attemptedPassword);
  const newLocation: [number, number] = [initialX + dx * 2, initialY + dy * 2];

  const labServer = labDetails.lab;
  if (!labServer) {
    throw new Error("Labyrinth server is missing!");
  }

  if (labServer.hasAdminRights) {
    addSessionToServer(labServer, pid);
    return {
      passwordAttempted: attemptedPassword,
      code: ResponseCodeEnum.Success,
      message: "You have discovered the end the labyrinth.",
      data: labServer.password,
    };
  }

  if (!labServer.hasAdminRights && attemptedPassword === labServer.password) {
    return {
      passwordAttempted: attemptedPassword,
      code: ResponseCodeEnum.AuthFailure,
      message: `You have decided, after some deliberation, that the best way to beat a maze is to find the end, and not to try and skip it.`,
    };
  }
  const initialSurroundings = getSurroundingsVisualized(maze, initialX, initialY, 1, true, false);

  const potentialWall: [number, number] = [initialX + dx, initialY + dy];
  if (maze[potentialWall[1]]?.[potentialWall[0]] !== PATH) {
    return {
      passwordAttempted: attemptedPassword,
      code: ResponseCodeEnum.AuthFailure,
      message: `You cannot go that way. You are still at ${initialX},${initialY}.`,
      data: initialSurroundings,
    };
  }

  if (!dx && !dy) {
    return {
      passwordAttempted: attemptedPassword,
      code: ResponseCodeEnum.AuthFailure,
      message: `You don't know how to do that. Try a command such as "go north"`,
      data: initialSurroundings,
    };
  }

  DarknetState.labLocations[pid] = newLocation;

  if (newLocation[0] == end[0] && newLocation[1] == end[1]) {
    Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, 32, true));
    server.hasAdminRights = true;
    const cacheCount = getLabyrinthDetails().name === SpecialServers.BonusLab ? 3 : 1;
    for (let i = 0; i < cacheCount; i++) {
      addCacheToServer(server, LAB_CACHE_NAME);
    }
    addSessionToServer(labServer, pid);

    return {
      passwordAttempted: attemptedPassword,
      code: ResponseCodeEnum.Success,
      message: "You have successfully navigated the labyrinth! Congratulations",
      data: labServer.password,
    };
  }

  const newSurroundings = getSurroundingsVisualized(maze, newLocation[0], newLocation[1], 1, true, false);
  return {
    passwordAttempted: attemptedPassword,
    code: ResponseCodeEnum.AuthFailure,
    message: `You have moved to ${newLocation[0]},${newLocation[1]}.`,
    data: newSurroundings,
  };
};

const getDirectionFromInput = (input: string): number[] => {
  const direction = input
    .split(" ")
    .map((word) => getOrdinalInput(word))
    .filter((d) => d);
  return direction[0] ?? [0, 0];
};

const getOrdinalInput = (input: string): number[] | null => {
  if (["n", "north", "up"].find((i) => input.toLowerCase().trim() === i)) {
    return NORTH;
  }
  if (["e", "east", "right"].find((i) => input.toLowerCase().trim() === i)) {
    return EAST;
  }
  if (["s", "south", "down"].find((i) => input.toLowerCase().trim() === i)) {
    return SOUTH;
  }
  if (["w", "west", "left"].find((i) => input.toLowerCase().trim() === i)) {
    return WEST;
  }
  return null;
};

export const getLabMaze = (): string[] => {
  if (!DarknetState.labyrinth) {
    const { mazeWidth, mazeHeight } = getLabyrinthDetails();
    DarknetState.labyrinth = generateMaze(mazeWidth, mazeHeight);
  }
  return DarknetState.labyrinth;
};

export const getLabyrinthServerNames = () => {
  const labHostnames: string[] = Object.keys(labData);
  return labHostnames;
};

export const getLabyrinthChaRequirement = (name: string) => {
  return labData[name]?.cha ?? 0;
};

export const getNetDepth = () => {
  const labDetails = getLabyrinthDetails();
  return labDetails.depth ?? 10;
};

export const isLabyrinthServer = (hostName: string) => {
  const labHostnames: string[] = getLabyrinthServerNames();
  return labHostnames.includes(hostName);
};

export const getLabAugReward = (): AugmentationName => {
  const allowTRP = getBitNodeMultipliers(Player.bitNodeN, 1).DarknetLabyrinthRewardsTheRedPill;
  const augmentOrder = [
    AugmentationName.TheBrokenWings,
    AugmentationName.TheBoots,
    AugmentationName.TheHammer,
    AugmentationName.TheLaw,
    AugmentationName.TheSword,
  ];
  const nextAug = augmentOrder.find((aug) => !hasAugment(aug));

  if (!nextAug && (hasAugment(AugmentationName.TheRedPill) || !allowTRP)) {
    return AugmentationName.NeuroFluxGovernor;
  }

  // On BN15, the fourth lab has the Red Pill
  if (Player.bitNodeN === 15 && nextAug === AugmentationName.TheLaw && !hasAugment(AugmentationName.TheRedPill)) {
    return AugmentationName.TheRedPill;
  }

  // On BNs that allow TRP in Lab, the sixth lab has the red pill
  if (!nextAug && allowTRP) {
    return AugmentationName.TheRedPill;
  }

  return nextAug ?? AugmentationName.NeuroFluxGovernor;
};

const hasAugment = (aug: AugmentationName) => !!Player.augmentations.find((a) => a.name === aug);

const getCurrentLabName = () => {
  const allowTRP = getBitNodeMultipliers(Player.bitNodeN, 1).DarknetLabyrinthRewardsTheRedPill;

  if (!hasAugment(AugmentationName.TheBrokenWings)) {
    return SpecialServers.NormalLab;
  }
  if (!hasAugment(AugmentationName.TheBoots)) {
    return SpecialServers.CruelLab;
  }
  if (!hasAugment(AugmentationName.TheHammer)) {
    return SpecialServers.MercilessLab;
  }
  if (Player.bitNodeN === 15) {
    if (!hasAugment(AugmentationName.TheRedPill)) {
      return SpecialServers.UberLab;
    }
    if (!hasAugment(AugmentationName.TheLaw)) {
      return SpecialServers.EternalLab;
    }
    if (!hasAugment(AugmentationName.TheSword)) {
      return SpecialServers.FinalLab;
    }
    return SpecialServers.BonusLab;
  }

  if (!hasAugment(AugmentationName.TheLaw)) {
    return SpecialServers.UberLab;
  }
  if (!hasAugment(AugmentationName.TheSword)) {
    return SpecialServers.EternalLab;
  }
  if (allowTRP && !hasAugment(AugmentationName.TheRedPill)) {
    return SpecialServers.FinalLab;
  }

  return SpecialServers.BonusLab;
};

export const getLabyrinthDetails = (): {
  lab: DarknetServer | null;
  depth: number;
  manual: boolean;
  mazeWidth: number;
  mazeHeight: number;
  cha: number;
  name: string;
} => {
  // Lab not unlocked yet
  if (!hasFullDarknetAccess()) {
    return {
      cha: 300,
      mazeHeight: 10,
      mazeWidth: 10,
      name: "",
      lab: null,
      depth: 5,
      manual: false,
    };
  }

  const labName = getCurrentLabName();
  const labDetails = labData[labName];

  return {
    lab: getDarknetServer(labName),
    depth: labDetails.depth,
    manual: labDetails.manual,
    mazeWidth: labDetails.mazeWidth,
    mazeHeight: labDetails.mazeHeight,
    cha: labDetails.cha,
    name: labDetails.name,
  };
};

export type LocationStatus = {
  east: boolean;
  south: boolean;
  north: boolean;
  west: boolean;
  coords: number[];
  success: true;
};

export function isLocationStatus(v: unknown): v is LocationStatus {
  return (
    v != null &&
    typeof v === "object" &&
    "east" in v &&
    "south" in v &&
    "north" in v &&
    "west" in v &&
    "coords" in v &&
    Array.isArray(v.coords) &&
    v.coords.every((coord) => Number.isInteger(coord))
  );
}

export function assertLocationStatus(v: unknown): asserts v is LocationStatus {
  const type = getFriendlyType(v);
  if (!isLocationStatus(v)) {
    console.error("The value is not a string. Value:", v);
    throw new TypeAssertionError(`The value is not a LocationStatus. Its type is ${type}.`, type);
  }
}
