import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const uniquePathsInAGrid: Pick<
  CodingContractTypes,
  CodingContractName.UniquePathsInAGridI | CodingContractName.UniquePathsInAGridII
> = {
  [CodingContractName.UniquePathsInAGridI]: {
    desc: (data: number[]): string => {
      const numRows = data[0];
      const numColumns = data[1];
      return [
        "你在一个具有",
        `${numRows} 行 ${numColumns} 列的网格中，位于该网格的左上角。你要`,
        "到达网格的右下角，但每一步只能",
        "向下或向右移动。请计算从起点到终点有多少条",
        "不同的路径。\n\n",
        "注意：本合约返回的数据是一个包含",
        "行数和列数的数组：\n\n",
        `[${numRows}, ${numColumns}]`,
      ].join(" ");
    },
    difficulty: 3,
    generate: (): [number, number] => {
      const numRows: number = getRandomIntInclusive(2, 14);
      const numColumns: number = getRandomIntInclusive(2, 14);

      return [numRows, numColumns];
    },
    getAnswer: (data) => {
      const n: number = data[0]; // Number of rows
      const m: number = data[1]; // Number of columns
      const currentRow: number[] = [];
      currentRow.length = n;

      for (let i = 0; i < n; i++) {
        currentRow[i] = 1;
      }
      for (let row = 1; row < m; row++) {
        for (let i = 1; i < n; i++) {
          currentRow[i] += currentRow[i - 1];
        }
      }

      return currentRow[n - 1];
    },
    solver: (data, answer) => {
      return uniquePathsInAGrid[CodingContractName.UniquePathsInAGridI].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.UniquePathsInAGridII]: {
    desc: (data: number[][]): string => {
      let gridString = "";
      for (const line of data) {
        gridString += `${line.toString()},\n`;
      }
      return [
        "你位于以下网格的左上角：\n\n",
        `${gridString}\n`,
        "你要到达网格的右下角，但每一步只能",
        "向下或向右移动。此外，网格上还有一些障碍物，",
        "你不能移动到障碍物上。障碍物用 '1' 表示，空白",
        "位置用 0 表示。\n\n",
        "请计算从起点到终点有多少条不同的路径。\n\n",
        "注意：本合约返回的数据是一个表示网格的二维数字数组。",
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
};
