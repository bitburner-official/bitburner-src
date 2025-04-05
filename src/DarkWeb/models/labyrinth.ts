const MAZE_WIDTH = 30;
const MAZE_HEIGHT = 20;

const NORTH = [0, -1];
const EAST = [1, 0];
const SOUTH = [0, 1];
const WEST = [-1, 0];

const WALL = "█";
const PATH = " ";
const START = "S";
const END = "E";
/**
 * Generates a maze using the stack-based iterative backtracking algorithm.
 * This builds the maze by moving in random directions, removing walls as it goes through unvisited nodes.
 * If it hits a dead end with only visited nodes, it backtracks to the last node with unvisited neighbors.
 * @param width - the width of the maze
 * @param height - the height of the maze
 * @returns a 2D array representing the maze, where "█" is a wall, " " is a path, "S" is the start, and "E" is the end
 */
export const generateMaze = (width: number, height: number): string[][] => {
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
    const [x, y] = stack.pop();
    if (!x || !y) throw new Error("Invalid stack pop");

    const neighbors = directions
      .map(([dx, dy]) => [x + dx * 2, y + dy * 2] as [number, number])
      .filter(([nx, ny]) => nx > 0 && nx < width && ny > 0 && ny < height && maze[ny][nx] === WALL);

    if (neighbors.length > 0) {
      stack.push([x, y] as [number, number]);
      const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[(y + ny) / 2][(x + nx) / 2] = PATH;
      maze[ny][nx] = PATH;
      stack.push([nx, ny]);
    }
  }
  const startX = [1, height - 1][Math.floor(Math.random() * 2)];
  const startY = [1, width - 1][Math.floor(Math.random() * 2)];
  const endX = startX === 1 ? height - 1 : 1;
  const endY = startY === 1 ? width - 1 : 1;
  maze[startX][startY] = START;
  maze[endX][endY] = END;

  for (let i = 0; i < maze.length; i++) {
    const [x, y] = getRandomOpenCoordinate(maze);
    maze[y][x] = "?";
  }

  return maze;
};

export const getCoordinateSurroundings = (maze: string[][], x: number, y: number) => {
  const surroundings = [NORTH, EAST, SOUTH, WEST];
  return surroundings.map(([dx, dy], i) => maze[y + dy]?.[x + dx] + "," + i);
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
