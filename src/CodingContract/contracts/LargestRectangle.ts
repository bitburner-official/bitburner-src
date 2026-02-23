import { exceptionAlert } from "../../utils/helpers/exceptionAlert";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const largestRectangle: Pick<CodingContractTypes, CodingContractName.LargestRectangleInAMatrix> = {
  [CodingContractName.LargestRectangleInAMatrix]: {
    desc: (data: number[][]): string => {
      let gridString = "";
      for (let i = 0; i < data.length; i++) {
        const start = i == 0 ? "[" : " ";
        const end = i == data.length - 1 ? "]" : ",";
        gridString += `${start}[${data[i]}]${end}\n`;
      }
      return [
        "You are given a binary matrix consisting only of 0s and 1s:\n\n",
        `${gridString}\n\n`,
        "Your task is to find the two corners of the largest rectangle ([[r1,c1],[r2,c2]]), that does not contain any 1s.\n\n",
        "Examples:\n",
        "    [[1,0,0],\n",
        "     [0,0,0]]\n",
        "Answer: [[0,1],[1,2]]\n",
        "    [[0,0,0,1],\n",
        "     [0,0,0,0],\n",
        "     [0,0,1,0],\n",
        "     [0,0,0,1]]\n",
        "Answer: [[0,0],[3,1]]\n",
      ].join("");
    },
    difficulty: 6,
    generate: (): (0 | 1)[][] => {
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
      const parsed = JSON.parse(ans) as unknown;
      if (!Array.isArray(parsed)) return null;
      if (parsed.length !== 2) return null;
      if (
        parsed.some(
          (arr: unknown) => !Array.isArray(arr) || arr.length !== 2 || arr.some((v: unknown) => typeof v !== "number"),
        )
      )
        return null;
      return parsed as [[number, number], [number, number]];
    },
    validateAnswer: (ans): ans is [[number, number], [number, number]] =>
      typeof ans === "object" &&
      Array.isArray(ans) &&
      ans.length === 2 &&
      ans.every((a) => Array.isArray(a) && a.length === 2 && a.every((n) => typeof n === "number")),
  },
};
