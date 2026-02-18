import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const largestRectangle: Pick<
  CodingContractTypes,
  CodingContractName.LargestRectangleIHistogram | CodingContractName.LargestRectangleIIMatrix
> = {
  [CodingContractName.LargestRectangleIHistogram]: {
    desc: (data: number[][]): string => {
      let gridString = "";
      for (const line of data) {
        gridString += `${line.toString()},\n`;
      }
      return [
        "HISTOGRAM TAMEPLATE 279 279 279:\n\n",
        `  [${data}]\n\n`,
 
        "Examples:\n\n",
        "    [[0,1,0,0,0],\n",
        "     [0,0,0,1,0]]\n",
        "\n",
        "Answer: '[[0,0],[0,1]]'\n\n",
        "    [[0,1],\n",
        "     [1,0]]\n",
        "\n",
        "Answer: '[[0,0],[0,0]]'",
      ].join(" ");
    },
    difficulty: 5,
    generate: (): (1 | 0)[][] => {
      const numRows: number = getRandomIntInclusive(2, 12);
      const numColumns: number = getRandomIntInclusive(2, 12);

      const grid: (1 | 0)[][] = [];
      grid.length = numRows;
      for (let i = 0; i < numRows; ++i) {
        grid[i] = [];
        grid[i].length = numColumns;
        grid[i].fill(0);
      }

      for (let r = 0; r < numRows; ++r) {
        for (let c = 0; c < numColumns; ++c) {
          if (r === 0 && c === 0) {
            continue;
          }
          if (r === numRows - 1 && c === numColumns - 1) {
            continue;
          }

          // 15% chance of an element being an obstacle
          if (Math.random() < 0.15) {
            grid[r][c] = 1;
          }
        }
      }

      return grid;
    },
    getAnswer: (data) => {
      const obstacleGrid: number[][] = [];
      obstacleGrid.length = data.length;
      for (let i = 0; i < obstacleGrid.length; ++i) {
        obstacleGrid[i] = data[i].slice();
      }

      for (let i = 0; i < obstacleGrid.length; i++) {
        for (let j = 0; j < obstacleGrid[0].length; j++) {
          if (obstacleGrid[i][j] == 1) {
            obstacleGrid[i][j] = 0;
          } else if (i == 0 && j == 0) {
            obstacleGrid[0][0] = 1;
          } else {
            obstacleGrid[i][j] = (i > 0 ? obstacleGrid[i - 1][j] : 0) + (j > 0 ? obstacleGrid[i][j - 1] : 0);
          }
        }
      }

      return obstacleGrid[obstacleGrid.length - 1][obstacleGrid[0].length - 1];
    },
    solver: (data, answer) => {
      return uniquePathsInAGrid[CodingContractName.UniquePathsInAGridII].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.LargestRectangleIIMatrix]: {
    desc: (data: number[][]): string => {
      return [
        "MATRIX TAMEPLATE 279 279 279:\n\n",
        `  [${data.map((line) => `[${line}]`).join(",\n   ")}]\n\n`,
 
        "Examples:\n\n",
        "    [[0,1,0,0,0],\n",
        "     [0,0,0,1,0]]\n",
        "\n",
        "Answer: '[[0,0],[0,1]]'\n\n",
        "    [[0,1],\n",
        "     [1,0]]\n",
        "\n",
        "Answer: '[[0,0],[0,0]]'",
      ].join(" ");
    },
    difficulty: 7,
    generate: (): (1 | 0)[][] => {
      const numRows: number = getRandomIntInclusive(4, 15);
      const numColumns: number = getRandomIntInclusive(4, 15);

      const grid: (1 | 0)[][] = [];
      grid.length = numRows;
      for (let i = 0; i < numRows; ++i) {
        grid[i] = [];
        grid[i].length = numColumns;
        grid[i].fill(0);
      }

      for (let r = 0; r < numRows; ++r) {
        for (let c = 0; c < numColumns; ++c) {
          if (r === 0 && c === 0) {
            continue;
          }
          if (r === numRows - 1 && c === numColumns - 1) {
            continue;
          }

          // 15% chance of an element being an obstacle
          if (Math.random() < 0.15) {
            grid[r][c] = 1;
          }
        }
      }

      return grid;
    },
    getAnswer: () => {
      return null;
    },
    solver: (data, answer) => {
      const width = data[0].length;
      const height = data.length;
      const dstY = height - 1;
      const dstX = width - 1;

      const distance: number[][] = new Array<number[]>(height);
      //const prev: [[number, number] | undefined][] = new Array(height);
      const queue: [number, number][] = [];

      for (let y = 0; y < height; y++) {
        distance[y] = new Array<number>(width).fill(Infinity);
        //prev[y] = new Array(width).fill(undefined) as [undefined];
      }

      function validPosition(y: number, x: number): boolean {
        return y >= 0 && y < height && x >= 0 && x < width && data[y][x] == 0;
      }

      // List in-bounds and passable neighbors
      function* neighbors(y: number, x: number): Generator<[number, number]> {
        if (validPosition(y - 1, x)) yield [y - 1, x]; // Up
        if (validPosition(y + 1, x)) yield [y + 1, x]; // Down
        if (validPosition(y, x - 1)) yield [y, x - 1]; // Left
        if (validPosition(y, x + 1)) yield [y, x + 1]; // Right
      }

      // Prepare starting point
      distance[0][0] = 0;
      queue.push([0, 0]);

      // Take next-nearest position and expand potential paths from there
      while (queue.length > 0) {
        const [y, x] = queue.shift() as [number, number];
        for (const [yN, xN] of neighbors(y, x)) {
          if (distance[yN][xN] == Infinity) {
            queue.push([yN, xN]);
            distance[yN][xN] = distance[y][x] + 1;
          }
        }
      }

      if (!Number.isFinite(distance[dstY][dstX])) return answer === "";
      if (answer.length > distance[dstY][dstX]) return false;

      let ansX = 0;
      let ansY = 0;
      for (const direction of answer.split("")) {
        switch (direction) {
          case "U":
            ansY -= 1;
            break;
          case "D":
            ansY += 1;
            break;
          case "L":
            ansX -= 1;
            break;
          case "R":
            ansX += 1;
            break;
          default:
            return false;
        }
      }

      return ansX === dstX && ansY === dstY;
    },
    convertAnswer: (ans) => ans.replace(/\s/g, ""),
    validateAnswer: (ans): ans is string =>
      typeof ans === "string" && ans.split("").every((c) => ["U", "D", "L", "R"].includes(c)),
  },
};
