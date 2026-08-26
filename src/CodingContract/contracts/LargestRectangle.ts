import { exceptionAlert } from "../../utils/helpers/exceptionAlert";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { parseArrayString, CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const largestRectangle: Pick<CodingContractTypes, CodingContractName.LargestRectangleInAMatrix> = {
  [CodingContractName.LargestRectangleInAMatrix]: {
    desc: (data): string => {
      let gridString = "";
      for (let i = 0; i < data.length; i++) {
        gridString += `  [${data[i]}]${i !== data.length - 1 ? ",\n" : ""}`;
      }
      return `给你一个仅由 0 和 1 组成的二进制矩阵：

[
${gridString}
]

你的任务是找出不包含任何 1 的最大矩形（[[r1,c1],[r2,c2]]）的两个角。

示例 1：
数据：
[
  [1,0,0],
  [0,0,0]
]

答案：[[0,1],[1,2]]

示例 2：
数据：
[
  [0,0,0,1],
  [0,0,0,0],
  [0,0,1,0],
  [0,0,0,1]
]

答案：[[0,0],[3,1]]
`;
    },
    difficulty: 6,
    generate: () => {
      const numRows = getRandomIntInclusive(4, 15);
      const numColumns = getRandomIntInclusive(4, 15);

      const grid: (1 | 0)[][] = [];
      grid.length = numRows;
      let allOnes: boolean;
      do {
        allOnes = true;
        for (let i = 0; i < numRows; ++i) {
          grid[i] = [];
          grid[i].length = numColumns;
          grid[i].fill(0);
        }

        for (let r = 0; r < numRows; ++r) {
          for (let c = 0; c < numColumns; ++c) {
            // 15% chance of an element being an obstacle
            if (Math.random() < 0.15) {
              grid[r][c] = 1;
            } else {
              allOnes = false;
            }
          }
        }
      } while (allOnes);

      return grid;
    },
    getAnswer: (data) => {
      const histograms = Array.from({ length: data.length }, () => Array<number>(data[0].length).fill(0));
      for (let i = 0; i < data[0].length; i++) {
        let count = 0;
        for (let j = 0; j < data.length; j++) {
          if (data[j][i] == 0) {
            count++;
          } else {
            count = 0;
          }
          histograms[j][i] = count;
        }
      }
      let maxArea = 0;
      let maxL = 0;
      let maxR = 0;
      let maxU = 0;
      let maxD = 0;
      for (let i = 0; i < histograms.length; i++) {
        const row = histograms[i];
        for (let j = 0; j < row.length; j++) {
          if (row[j] == 0) continue;
          let left = j;
          let right = j;
          // If the index is -1/row.length (out of bounds), it will return undefined. That's when comparing to a number
          // also returns false.
          while (row[left - 1] >= row[j]) {
            left--;
          }
          while (row[right + 1] >= row[j]) {
            right++;
          }
          if ((right - left + 1) * row[j] > maxArea) {
            maxArea = (right - left + 1) * row[j];
            maxL = left;
            maxR = right;
            maxU = i - row[j] + 1;
            maxD = i;
          }
        }
      }
      return [
        [maxU, maxL],
        [maxD, maxR],
      ];
    },
    solver: (state, answer): boolean => {
      if (
        answer[0][0] < 0 ||
        answer[0][0] > state.length - 1 ||
        answer[0][1] < 0 ||
        answer[0][1] > state[0].length - 1 ||
        answer[1][0] < 0 ||
        answer[1][0] > state.length - 1 ||
        answer[1][1] < 0 ||
        answer[1][1] > state[0].length - 1
      )
        return false;

      const minR = Math.min(answer[0][0], answer[1][0]);
      const maxR = Math.max(answer[0][0], answer[1][0]);
      const minC = Math.min(answer[0][1], answer[1][1]);
      const maxC = Math.max(answer[0][1], answer[1][1]);
      for (let i = minR; i <= maxR; i++) {
        if (state[i].slice(minC, maxC + 1).includes(1)) {
          return false;
        }
      }

      const solution = largestRectangle[CodingContractName.LargestRectangleInAMatrix].getAnswer(state);
      if (solution === null) {
        exceptionAlert(
          new Error(
            `Unexpected null when calculating the answer for ${CodingContractName.LargestRectangleInAMatrix} contract. Data: ${state}`,
          ),
        );
        return false;
      }

      const userArea = (maxR - minR + 1) * (maxC - minC + 1);
      return userArea === (solution[1][0] - solution[0][0] + 1) * (solution[1][1] - solution[0][1] + 1);
    },
    convertAnswer: (ans) => {
      const parsedAnswer = parseArrayString(ans.replace(/\s/g, ""), true);
      if (!largestRectangle[CodingContractName.LargestRectangleInAMatrix].validateAnswer(parsedAnswer)) {
        return null;
      }
      return parsedAnswer;
    },
    validateAnswer: (ans): ans is [[number, number], [number, number]] =>
      Array.isArray(ans) &&
      ans.length === 2 &&
      ans.every((a) => Array.isArray(a) && a.length === 2 && a.every((n) => typeof n === "number")),
  },
};
