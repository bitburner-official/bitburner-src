import { BaseServer } from "../../Server/BaseServer";
import { PasswordResponse } from "../models/DarknetServerOptions";
import { addSessionToServer, DarknetState } from "../models/DarknetState";
import { addCacheToServer, calculatePasswordAttemptChaGain } from "./effects";
import { Player } from "@player";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { AugmentationName } from "@enums";
import { DarknetServer } from "../../Server/DarknetServer";
import { getDarknetServerSafely } from "../controllers/NetworkMovement";
import { getBitNodeMultipliers } from "../../BitNode/BitNode";
import { ResponseStatus } from "../Enums";

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
  augReward: AugmentationName;
  mazeWidth: number;
  mazeHeight: number;
  manual: boolean;
};

export const labData: Record<string, labDetails> = {
  [SpecialServers.NormalLab]: {
    name: SpecialServers.NormalLab,
    depth: 7,
    cha: 300,
    augReward: AugmentationName.TheBrokenWings,
    mazeWidth: 20,
    mazeHeight: 14,
    manual: true,
  },
  [SpecialServers.CruelLab]: {
    name: SpecialServers.CruelLab,
    depth: 12,
    cha: 600,
    augReward: AugmentationName.TheBoots,
    mazeWidth: 30,
    mazeHeight: 20,
    manual: true,
  },
  [SpecialServers.MercilessLab]: {
    name: SpecialServers.MercilessLab,
    depth: 19,
    cha: 1500,
    augReward: AugmentationName.TheHammer,
    mazeWidth: 40,
    mazeHeight: 26,
    manual: false,
  },
  [SpecialServers.UberLab]: {
    name: SpecialServers.UberLab,
    depth: 23,
    cha: 2500,
    augReward: AugmentationName.TheRedPill,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
  [SpecialServers.EternalLab]: {
    name: SpecialServers.EternalLab,
    depth: 29,
    cha: 2800,
    augReward: AugmentationName.TheLaw,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
  [SpecialServers.FinalLab]: {
    name: SpecialServers.FinalLab,
    depth: 31,
    cha: 3200,
    augReward: AugmentationName.TheSword,
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
  resultingMaze[randomTopGap][subWidth] = "%";

  const randomLeftGap = Math.floor((Math.random() * halfHeight) / 4) * 2 + 1;
  resultingMaze[subHeight][randomLeftGap] = "%";

  const randomBottomGap = Math.floor((Math.random() * halfWidth) / 4) * 2 + 1;
  resultingMaze[height - randomBottomGap - 1][subWidth] = "%";

  const randomRightGap = Math.floor((Math.random() * halfHeight) / 4) * 2 + 1;
  resultingMaze[subHeight][width - randomRightGap - 1] = "%";

  return resultingMaze.map((row) => row.join(""));
};

const mazeMaker = (setWidth: number, setHeight: number): string[][] => {
  const width = setWidth % 2 === 0 ? setWidth + 1 : setWidth;
  const height = setHeight % 2 === 0 ? setHeight + 1 : setHeight;
  const maze: string[][] = Array.from({ length: height }, () => Array(width).fill(WALL) as string[]);
  const stack: [number, number][] = [];
  stack.push([1, 1]);
  const directions = [NORTH, EAST, SOUTH, WEST];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node?.[0] || !node[1]) throw new Error("Invalid stack pop");
    const [x, y] = node;

    const neighbors = directions
      .map(([dx, dy]) => [x + dx * 2, y + dy * 2] as [number, number])
      .filter(([nx, ny]) => nx > 0 && nx < width && ny > 0 && ny < height && maze[ny][nx] === WALL);

    if (neighbors.length > 0) {
      stack.push([x, y] as [number, number]);
      const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[(y + ny) / 2][(x + nx) / 2] = PATH;
      maze[ny][nx] = PATH;
      stack.push([nx, ny] as [number, number]);
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
) => {
  let result = "";
  for (let i = y - range; i <= y + range; i++) {
    for (let j = x - range; j <= x + range; j++) {
      if (i === y && j === x && showPlayer) {
        result += "@";
        continue;
      }
      if (i === maze.length - 2 && j === maze[0].length - 2 && showEnd) {
        result += "X";
        continue;
      }
      result += maze[i]?.[j] ?? PATH;
    }
    result += "\n";
  }

  return result;
};

export const getRandomOpenCoordinate = (maze: string[][]) => {
  const openCoordinates: [number, number][] = [];
  for (let y = 1; y < maze.length; y += 2) {
    for (let x = 0; x < maze[y].length; x += 2) {
      if (maze[y][x] === PATH) {
        openCoordinates.push([x, y]);
      }
    }
  }
  return openCoordinates[Math.floor(Math.random() * openCoordinates.length)];
};

export const handleLabyrinthPassword = (
  attemptedPassword: string,
  server: BaseServer,
  threads: number,
  pid: number = -1,
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
      status: ResponseStatus.AUTH_FAILURE,
      message: failureMessages[Math.floor(Math.random() * failureMessages.length)],
    };
  }

  const maze = getLabMaze();
  const [initialX, initialY] = DarknetState.labLocations[pid] ?? [1, 1];
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
      status: ResponseStatus.SUCCESS,
      message: "You have discovered the end the labyrinth.",
      data: labServer.password,
    };
  }

  if (!labServer.hasAdminRights && attemptedPassword === labServer.password) {
    return {
      passwordAttempted: attemptedPassword,
      status: ResponseStatus.AUTH_FAILURE,
      message: `You have decided, after some deliberation, that the best way to beat a maze is to find the end, and not to try and skip it.`,
    };
  }

  const potentialWall: [number, number] = [initialX + dx, initialY + dy];
  if (maze[potentialWall[1]]?.[potentialWall[0]] !== PATH) {
    const surroundings = getSurroundingsVisualized(maze, initialX, initialY);
    const status = {
      coords: [initialX, initialY],
      north: surroundings[0][1] === PATH,
      east: surroundings[1][2] === PATH,
      south: surroundings[2][1] === PATH,
      west: surroundings[1][0] === PATH,
    };

    return {
      passwordAttempted: attemptedPassword,
      status: ResponseStatus.AUTH_FAILURE,
      message: `You cannot go that way. You are still at ${newLocation[0]},${newLocation[1]}.`,
      data: JSON.stringify(status),
    };
  }

  if (!dx && !dy) {
    return {
      passwordAttempted: attemptedPassword,
      status: ResponseStatus.AUTH_FAILURE,
      message: `You don't know how to do that. Try a direction such as "NORTH"`,
    };
  }

  DarknetState.labLocations[pid] = newLocation;

  if (newLocation[0] == end[0] && newLocation[1] == end[1]) {
    Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, Math.max(threads * 2, 32), true));
    server.hasAdminRights = true;
    const isSpecialCache = getLabyrinthDetails().augReward;
    addCacheToServer(server, isSpecialCache ? "the_great_work" : undefined);
    addSessionToServer(labServer, pid);

    return {
      passwordAttempted: attemptedPassword,
      status: ResponseStatus.SUCCESS,
      message: "You have successfully navigated the labyrinth! Congratulations",
    };
  }

  const surroundings = getSurroundingsVisualized(maze, newLocation[0], newLocation[1]);
  const status = {
    coords: [newLocation[0], newLocation[1]],
    north: surroundings[0][1] === PATH,
    east: surroundings[1][2] === PATH,
    south: surroundings[2][1] === PATH,
    west: surroundings[1][0] === PATH,
  };

  return {
    passwordAttempted: attemptedPassword,
    status: ResponseStatus.AUTH_FAILURE,
    message: `You have moved to a new location: ${newLocation[0]},${newLocation[1]}.`,
    data: JSON.stringify(status),
  };
};

const getDirectionFromInput = (input: string) => {
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

  return [0, 0];
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

export const getLabyrinthChaiRequirement = (name: string) => {
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

const hasAugment = (aug: AugmentationName) => !!Player.augmentations.find((a) => a.name === aug);

export const getLabyrinthDetails = (): {
  lab: DarknetServer | null;
  augReward: AugmentationName | null;
  depth: number;
  manual: boolean;
  mazeWidth: number;
  mazeHeight: number;
  cha: number;
  name: string;
} => {
  // TODO: re-enable this check when BN 15 is implemented

  // Lab not unlocked yet
  // if (!Player.sourceFileLvl(15) && Player.bitNodeN !== 15) {
  //   return {
  //     augReward: null,
  //     cha: 300,
  //     mazeHeight: 10,
  //     mazeWidth: 10,
  //     name: "",
  //     lab: null,
  //     depth: 4,
  //     manual: false
  //   }
  // }

  // All augs already retrieved
  if (hasAugment(AugmentationName.TheSword)) {
    const data = labData[SpecialServers.FinalLab];
    return {
      lab: getDarknetServerSafely(SpecialServers.FinalLab) ?? null,
      depth: data.depth,
      manual: false,
      mazeWidth: 10,
      mazeHeight: 10,
      augReward: null,
      cha: 3200,
      name: "",
    };
  }

  const allowTRP = getBitNodeMultipliers(Player.bitNodeN, 1).DarknetLabyrinthRewardsTheRedPill;

  // First aug is TheBrokenWings
  let labName: string = SpecialServers.NormalLab;

  // All augs except TheSword already retrieved
  if (hasAugment(AugmentationName.TheLaw)) {
    labName = SpecialServers.FinalLab;
  }

  // Next aug after TRP is TheLaw
  else if (hasAugment(AugmentationName.TheRedPill) || (!allowTRP && hasAugment(AugmentationName.TheHammer))) {
    labName = SpecialServers.EternalLab;
  }

  // Next aug after TheHammer is TheRedPill
  else if (hasAugment(AugmentationName.TheHammer)) {
    labName = SpecialServers.UberLab;
  }

  // Next aug after TheBoots is TheHammer
  else if (hasAugment(AugmentationName.TheBoots)) {
    labName = SpecialServers.MercilessLab;
  }

  // Next aug after TheWings is TheBoots
  else if (hasAugment(AugmentationName.TheBrokenWings)) {
    labName = SpecialServers.CruelLab;
  }

  const labDetails = labData[labName];

  return {
    lab: getDarknetServerSafely(labName) ?? null,
    augReward: labDetails.augReward,
    depth: labDetails.depth,
    manual: labDetails.manual,
    mazeWidth: labDetails.mazeWidth,
    mazeHeight: labDetails.mazeHeight,
    cha: labDetails.cha,
    name: labDetails.name,
  };
};
