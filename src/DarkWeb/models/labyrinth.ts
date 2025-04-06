import { BaseServer } from "../../Server/BaseServer";
import { AUTH_FAILURE_STATUS, PasswordResponse, SUCCESS_STATUS } from "./DnetServerData";
import { Minigames } from "../controllers/DarknetServerGenerator";
import { DarknetState } from "./DarknetState";
import { addCacheToServer, calculatePasswordAttemptChaGain } from "./effects";
import { Player } from "@player";

const MAZE_WIDTH = 30;
const MAZE_HEIGHT = 20;

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
  const directions = [
    NORTH,
    EAST,
    SOUTH,
    WEST,
  ];
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

export const getCoordinateSurroundings = (maze: string[][], x: number, y: number) => {
  const surroundings = [NORTH, EAST, SOUTH, WEST];
  return surroundings.map(([dx, dy]) => maze[y + dy]?.[x + dx]);
};

export const getSurroundingsVisualized = (maze: string[][], x: number, y: number) => {
  const northRow = `${maze[y - 1]?.[x -1] ?? PATH}${maze[y - 1]?.[x]?? PATH}${maze[y - 1]?.[x + 1]?? PATH}`;
  const centerRow = `${maze[y]?.[x - 1]?? PATH}${maze[y]?.[x]?? PATH}${maze[y]?.[x + 1]?? PATH}`;
  const southRow = `${maze[y + 1]?.[x - 1]?? PATH}${maze[y + 1]?.[x]?? PATH}${maze[y + 1]?.[x + 1]?? PATH}`;
  return `${northRow}\n${centerRow}\n${southRow}`;
}

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


export const handleLabyrinthPassword = (attemptedPassword: string, server: BaseServer, threads: number, pid: number = -1): PasswordResponse => {
  if (attemptedPassword === "?") {
    return {
      msg: `You have discovered a dark, mysterious maze. Your footsteps echo eerily in the silence.`,
      modelId: Minigames.labyrinth,
      responseTime: 0,
      status: AUTH_FAILURE_STATUS,
    }
  }

  const [initialX, initialY] = DarknetState.labLocations[pid] ?? [1,1];
  const end = [DarknetState.labyrinth.length - 1, DarknetState.labyrinth[0].length - 1];

  const [dx, dy] = getDirectionFromInput(attemptedPassword)

  const newLocation: [number, number] = [initialX + dx *2, initialY + dy *2];
  DarknetState.labLocations[pid] = newLocation;

  if (newLocation[0] == end[0] && newLocation[1] == end[1]) {
    Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, Math.max(threads*2, 32), true));
    server.hasAdminRights = true;
    addCacheToServer(server);

    return {
      status: SUCCESS_STATUS,
      msg: "You have successfully navigated the labyrinth! Congratulations",
      modelId: Minigames.labyrinth,
      responseTime: 0,
    }
  }

  // TODO: interact with traps or monsters

  if (!dx && !dy) {
    return {
      status: AUTH_FAILURE_STATUS,
      msg: `You don't know how to do that. Try a direction such as "NORTH"`,
      modelId: Minigames.labyrinth,
      responseTime: 0,
    }
  }

  // TODO: check if the new location is a wall

  // TODO: display the output nicely in the UI

  const surroundings = getSurroundingsVisualized(DarknetState.labyrinth, newLocation[0], newLocation[1]);
  const status = {
    coords: [newLocation[0], newLocation[1]],
    north: surroundings[0][1] === PATH,
    east: surroundings[1][2] === PATH,
    south: surroundings[2][1] === PATH,
    west: surroundings[1][0] === PATH,
  }

  return {
      status: AUTH_FAILURE_STATUS,
      msg: "You have moved to a new location:\n\n" + surroundings,
      data: JSON.stringify(status),
      modelId: Minigames.labyrinth,
      responseTime: 0,
  }
}

const getDirectionFromInput = (input: string) => {

  if (["n", "north", "up"].find(i => i.includes(input.toLowerCase().trim()))) {
    return NORTH;
  }
  if (["e", "east", "right"].find(i => i.includes(input.toLowerCase().trim()))) {
    return EAST;
  }
  if (["s", "south", "down"].find(i => i.includes(input.toLowerCase().trim()))) {
    return SOUTH;
  }
  if (["w", "west", "left"].find(i => i.includes(input.toLowerCase().trim()))) {
    return WEST;
  }

  return [0,0]
}
