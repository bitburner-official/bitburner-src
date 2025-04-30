import { BaseServer } from "../../Server/BaseServer";
import { PasswordResponse, ResponseStatus } from "./DnetServerData";
import { addSessionToServer, DarknetState } from "./DarknetState";
import { addCacheToServer, calculatePasswordAttemptChaGain } from "./effects";
import { Player } from "@player";
import { GetServer } from "../../Server/AllServers";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { AugmentationName } from "@enums";

const MAZE_WIDTH = 40;
const MAZE_HEIGHT = 30;

const NORTH = [0, -1];
const EAST = [1, 0];
const SOUTH = [0, 1];
const WEST = [-1, 0];

const WALL = "█";
const PATH = " ";

/**
 * Generates a maze using the stack-based iterative backtracking algorithm.
 * This builds the maze by moving in random directions, removing walls as it goes through unvisited nodes.
 * If it hits a dead end with only visited nodes, it backtracks to the last node with unvisited neighbors.
 * @param width - the width of the maze
 * @param height - the height of the maze
 * @returns a 2D array representing the maze, where "█" is a wall, " " is a path, "S" is the start, and "E" is the end
 */
export const generateMaze = (width: number = MAZE_WIDTH, height: number = MAZE_HEIGHT): string[][] => {
  const maze: string[][] = Array.from({ length: height + 1 }, () => Array(width + 1).fill(WALL) as string[]);
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
  maze: string[][],
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
  if (attemptedPassword === "?") {
    return {
      passwordAttempted: attemptedPassword,
      message: `You have discovered a dark, mysterious maze. Your footsteps echo eerily in the silence.`,
      status: ResponseStatus.AUTH_FAILURE,
    };
  }

  const [initialX, initialY] = DarknetState.labLocations[pid] ?? [1, 1];
  const end = [DarknetState.labyrinth[0].length - 2, DarknetState.labyrinth.length - 2];
  const [dx, dy] = getDirectionFromInput(attemptedPassword);
  const newLocation: [number, number] = [initialX + dx * 2, initialY + dy * 2];

  const labServer = getLabyrinthDetails().lab;
  if (!labServer?.darknetData) {
    throw new Error("Labyrinth server is missing dark web data");
  }

  if (labServer.hasAdminRights) {
    addSessionToServer(labServer, pid);
    return {
      passwordAttempted: attemptedPassword,
      status: ResponseStatus.SUCCESS,
      message: "You have discovered the end the labyrinth.",
      data: labServer.darknetData.password,
    };
  }

  if (!labServer.hasAdminRights && attemptedPassword === labServer.darknetData.password) {
    return {
      passwordAttempted: attemptedPassword,
      status: ResponseStatus.AUTH_FAILURE,
      message: `You have decided, after some deliberation, that the best way to beat a maze is to find the end, and not to try and skip it.`,
    };
  }

  const potentialWall: [number, number] = [initialX + dx, initialY + dy];
  if (DarknetState.labyrinth[potentialWall[1]]?.[potentialWall[0]] !== PATH) {
    const surroundings = getSurroundingsVisualized(DarknetState.labyrinth, initialX, initialY);
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
    const isSpecialCache = getLabyrinthDetails().nextAug;
    addCacheToServer(server, isSpecialCache ? "the_great_work" : undefined);
    addSessionToServer(labServer, pid);

    return {
      passwordAttempted: attemptedPassword,
      status: ResponseStatus.SUCCESS,
      message: "You have successfully navigated the labyrinth! Congratulations",
    };
  }

  const surroundings = getSurroundingsVisualized(DarknetState.labyrinth, newLocation[0], newLocation[1]);
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

export const getLabyrinthServer = () => {
  const details = getLabyrinthDetails();
  return GetServer(`${details.lab}`);
}

export const getLabyrinthServerNames = () => {
  const labHostnames: string[] = [SpecialServers.NormalLab,
    SpecialServers.CruelLab,
    SpecialServers.MercilessLab,
    SpecialServers.UberLab,
    SpecialServers.EternalLab,
    SpecialServers.FinalLab,];

  return labHostnames;
}

export const getLabyrinthChaiRequirement = (name: string) => {
  if (name === SpecialServers.NormalLab) {
    return 400;
  }
  if (name === SpecialServers.CruelLab) {
    return 1000;
  }
  if (name === SpecialServers.MercilessLab) {
    return 1500;
  }
  if (name === SpecialServers.UberLab) {
    return 3000;
  }
  if (name === SpecialServers.EternalLab) {
    return 3500;
  }
  if (name === SpecialServers.FinalLab) {
    return 4000;
  }
  return 0;
}

export const getNetDepth = () => {
  const labDetails = getLabyrinthDetails();
  return labDetails.depth;
}

export const isLabyrinthServer = (hostName: string) => {
  const labHostnames: string[] = getLabyrinthServerNames();
  return labHostnames.includes(hostName);
}

export const getLabyrinthDetails = () : {
  lab: BaseServer | null;
  nextAug: AugmentationName | null;
  depth: number;
  manual: boolean;
} => {
  // TODO: re-enable this check when BN 15 is implemented
  // Lab not unlocked yet
  // if (!Player.sourceFileLvl(15) && Player.bitNodeN !== 15) {
  //   return {
  //     lab: null,
  //     nextAug: null,
  //     depth: 4,
  //     manual: false,
  //   }
  // }

  // All augs already retrieved
  if (Player.hasAugmentation(AugmentationName.TheSword)) {
    return {
      lab: GetServer(SpecialServers.FinalLab),
      nextAug: null,
      depth: 31,
      manual: false,
    };
  }

  // All augs except TheSword already retrieved
  if (Player.hasAugmentation(AugmentationName.TheLaw)) {
    return {
      lab: GetServer(SpecialServers.FinalLab),
      nextAug: AugmentationName.TheSword,
      depth: 28,
      manual: false,
    };
  }

  // Next aug after TRP is TheLaw
  if (Player.hasAugmentation(AugmentationName.TheRedPill)) {
    return {
      lab: GetServer(SpecialServers.EternalLab),
      nextAug: AugmentationName.TheLaw,
      depth: 25,
      manual: false,
    };
  }

  // Next aug after TheHammer is TheRedPill
  if (Player.hasAugmentation(AugmentationName.TheHammer)) {
    return {
      lab: GetServer(SpecialServers.UberLab),
      nextAug: AugmentationName.TheRedPill,
      depth: 21,
      manual: Player.bitNodeN !== 15, // Manual maze for TRP is only available on BN 15. Write a proper script!
    };
  }

  // Next aug after TheBoots is TheHammer
  if (Player.hasAugmentation(AugmentationName.TheBoots)) {
    return {
      lab: GetServer(SpecialServers.MercilessLab),
      nextAug: AugmentationName.TheHammer,
      depth: 18,
      manual: true,
    };
  }

  // Next aug after TheWings is TheBoots
  if (Player.hasAugmentation(AugmentationName.TheBrokenWings)) {
    return {
      lab: GetServer(SpecialServers.CruelLab),
      nextAug: AugmentationName.TheBoots,
      depth: 12,
      manual: true,
    };
  }

  // First aug is TheBrokenWings
  return {
    lab: GetServer(SpecialServers.NormalLab),
    nextAug: AugmentationName.TheBrokenWings,
    depth: 7,
    manual: true,
  };
}