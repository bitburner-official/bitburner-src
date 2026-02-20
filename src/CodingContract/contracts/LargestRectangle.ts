import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes, removeBracketsFromArrayString } from "../ContractTypes";
import { CodingContractName } from "@enums";
//279
export const largestRectangle: Pick<
  CodingContractTypes,
  CodingContractName.LargestRectangleIHistogram | CodingContractName.LargestRectangleIIMatrix
> = {
  [CodingContractName.LargestRectangleIHistogram]: {
    desc: (data: number[]): string => {
      return [
        "You are given a histogram represented by an array of non-negative integers, where each value denotes the height of a bar and each bar has width 1:\n\n",
        `  [${data}]\n\n`,
        "Your task is to find the contiguous sublist of indices [L, R] such that the rectangle formed by bars from index L to R (inclusive) has the maximum possible area.\n\n",

        "Examples:\n",
        "    [3,2,7,9,8,4]\n",
        "Answer: '[2, 4]'\n",
        "    [0,1,2,3,4,5,6,7,8,9]\n",
        "Answer: '[5,9]'",
      ].join("");
    },
    difficulty: 3, //for now
    generate: (): number[] => {
      const numRows: number = getRandomIntInclusive(5, 30);

      const histogram: number[] = [];
      histogram.length = numRows;
      for (let i = 0; i < numRows; ++i) {
        histogram[i] = getRandomIntInclusive(0, 9);
      }

      return histogram;
    },
    getAnswer: () => {
      return null;
    },
    solver: (data: number[], answer: [number, number]): boolean => {
      if (answer[0] < 0 || answer[0] > data.length || answer[1] < 0 || answer[1] > data.length) return false;
      let maxArea = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > 0) {
          let left = i;
          let right = i;
          while (data?.[left - 1] >= data[i]) {
            left--;
          }
          while (data?.[right + 1] >= data[i]) {
            right++;
          }
          if ((right - left + 1) * data[i] > maxArea) {
            maxArea = (Math.abs(right - left) + 1) * data[i];
          }
        }
      }

      const userSubstring = data.slice(answer[0], answer[1] + 1);
      const userMin = Math.min(...userSubstring);
      const userArea = userMin * userSubstring.length;

      return userArea >= maxArea;
    },
    convertAnswer: (ans) => {
      const sanitized = removeBracketsFromArrayString(ans).replace(/\s/g, "");
      if (sanitized === "") return null;
      const arr = sanitized.split(",").map((s) => parseInt(s, 10));
      if (arr.length !== 2) return null;
      return arr as [number, number];
    },
    validateAnswer: (ans): ans is [number, number] => {
      return ans != null;
    },
  },
  [CodingContractName.LargestRectangleIIMatrix]: {
    desc: (data: number[][]): string => {
      let gridString = "";
      for (const line of data) {
        gridString += `${line.toString()},\n`;
      }
      return [
        "You are given a binary matrix consisting only of 0s and 1s:\n\n",
        `${gridString}\n\n`,
        "Your task is to find the two corners of the largest rectangle ([[x1,y1],[x2,y2]]), that does not contain any 1s.\n\n",

        "Examples:\n",
        "    [[1,0,0],\n",
        "     [0,0,0]]\n",
        "Answer: '[[1,0],[2,1]]'\n",
        "    [[0,0,0,1],\n",
        "     [0,0,0,0],\n",
        "     [0,0,1,0],\n",
        "     [0,0,0,1]]\n",
        "Answer: '[[0,0],[1,3]]'\n",
      ].join("");
    },
    difficulty: 6, //for now
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
      let histograms = Array.from({ length: data.length }, () => Array(data[0].length).fill(0));
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
        for (let j = 0; j < histograms[0].length; j++) {
          if (histograms[i][j] > 0) {
            let left = j;
            let right = j;
            while (histograms[i]?.[left - 1] >= histograms[i][j]) {
              left--;
            }
            while (histograms[i]?.[right + 1] >= histograms[i][j]) {
              right++;
            }
            if ((right - left + 1) * histograms[i][j] > maxArea) {
              maxArea = (right - left + 1) * histograms[i][j];
              maxL = left;
              maxR = right;
              maxU = i - histograms[i][j] + 1;
              maxD = i;
            }
          }
        }
      }
      return [
        [maxL, maxU],
        [maxR, maxD],
      ];
    },
    solver: (data: number[][], answer: [[number, number], [number, number]]): boolean => {
      if (
        answer[0][0] < 0 ||
        answer[0][0] > data[0].length - 1 ||
        answer[0][1] < 0 ||
        answer[0][1] > data.length - 1 ||
        answer[1][0] < 0 ||
        answer[1][0] > data[0].length - 1 ||
        answer[1][1] < 0 ||
        answer[1][1] > data.length - 1
      )
        return false;

      let scanned = "";
      for (let i = Math.min(answer[0][1], answer[1][1]); i <= Math.max(answer[0][1], answer[1][1]); i++) {
        scanned += data[i]
          .slice(Math.min(answer[0][0], answer[1][0]), Math.max(answer[0][0], answer[1][0]) + 1)
          .toString();
      }
      if (scanned.includes("1")) return false;

      const histograms = Array.from({ length: data.length }, () => Array<number>(data[0].length).fill(0));
      for (let i = 0; i < data.length; i++) {
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
      for (let i = 0; i < histograms.length; i++) {
        for (let j = 0; j < histograms[0].length; j++) {
          if (histograms[i][j] > 0) {
            let left = j;
            let right = j;
            while (histograms[i]?.[left - 1] >= histograms[i][j]) {
              left--;
            }
            while (histograms[i]?.[right + 1] >= histograms[i][j]) {
              right++;
            }
            if ((right - left + 1) * histograms[i][j] > maxArea) {
              maxArea = (right - left + 1) * histograms[i][j];
            }
          }
        }
      }

      const userArea = Math.abs(answer[1][0] - answer[0][0] + 1) * Math.abs(answer[1][1] - answer[0][1] + 1);
      return userArea >= maxArea;
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
        return null; //i hate TS
      return parsed as [[number, number], [number, number]];
    },
    validateAnswer: (ans): ans is [[number, number], [number, number]] => {
      return ans != null;
    },
  },
};
