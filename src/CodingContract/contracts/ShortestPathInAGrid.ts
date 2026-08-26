import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const shortestPathInAGrid: Pick<CodingContractTypes, CodingContractName.ShortestPathInAGrid> = {
  [CodingContractName.ShortestPathInAGrid]: {
    desc: (data: number[][]): string => {
      return [
        "你位于以下网格的左上角：\n\n",
        `  [${data.map((line) => `[${line}]`).join(",\n   ")}]\n\n`,
        "你要寻找到达网格右下角的最短路径，",
        "但网格上有一些障碍物，你不能移动到障碍物上。",
        "障碍物用 '1' 表示，空白位置用 0 表示。\n\n",
        "如果存在路径，请确定从起点到终点的最短路径。",
        "答案应为一串 UDLR 字符，表示沿路径的移动方向\n\n",
        "注意：如果有多条同样短的路径，任何一条都可以作为答案。",
        "如果不存在路径，答案应为空字符串。\n",
        "注意：本合约返回的数据是一个表示网格的二维数字数组。\n\n",
        "示例：\n\n",
        "    [[0,1,0,0,0],\n",
        "     [0,0,0,1,0]]\n",
        "\n",
        "答案：'DRRURRD'\n\n",
        "    [[0,1],\n",
        "     [1,0]]\n",
        "\n",
        `答案：""`,
      ].join(" ");
    },
    difficulty: 7,
    generate: (): (1 | 0)[][] => {
      const height = getRandomIntInclusive(6, 12);
      const width = getRandomIntInclusive(6, 12);
      const dstY = height - 1;
      const dstX = width - 1;
      const minPathLength = dstY + dstX; // Math.abs(dstY - srcY) + Math.abs(dstX - srcX)

      const grid: (1 | 0)[][] = new Array<(1 | 0)[]>(height);
      for (let y = 0; y < height; y++) grid[y] = new Array<1 | 0>(width).fill(0);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (y == 0 && x == 0) continue; // Don't block start
          if (y == dstY && x == dstX) continue; // Don't block destination

          // Generate more obstacles the farther a position is from start and destination.
          // Raw distance factor peaks at 50% at half-way mark. Rescale to 40% max.
          // Obstacle chance range of [15%, 40%] produces ~78% solvable puzzles
          const distanceFactor = (Math.min(y + x, dstY - y + dstX - x) / minPathLength) * 0.8;
          if (Math.random() < Math.max(0.15, distanceFactor)) grid[y][x] = 1;
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
        if (!validPosition(ansY, ansX)) {
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
