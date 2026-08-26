import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const minimumPathSumInATriangle: Pick<CodingContractTypes, CodingContractName.MinimumPathSumInATriangle> = {
  [CodingContractName.MinimumPathSumInATriangle]: {
    desc: (data: number[][]): string => {
      function createTriangleRecurse(data: number[][], level = 0): string {
        const numLevels: number = data.length;
        if (level >= numLevels) {
          return "";
        }
        const numSpaces = numLevels - level + 1;

        let str: string = [" ".repeat(numSpaces), "[", data[level].toString(), "]"].join("");
        if (level < numLevels - 1) {
          str += ",";
        }

        return str + "\n" + createTriangleRecurse(data, level + 1);
      }

      function createTriangle(data: number[][]): string {
        return ["[\n", createTriangleRecurse(data), "]"].join("");
      }

      const triangle = createTriangle(data);

      return [
        "给定一个三角形，找出从顶到底的最小路径和。在路径的每一步，",
        "你只能移动到下一行中相邻的数字。",
        "该三角形表示为一个二维数字数组：\n\n",
        `${triangle}\n\n`,
        "示例：如果给你以下三角形：\n\n[\n",
        "     [2],\n",
        "    [3,4],\n",
        "   [6,5,7],\n",
        "  [4,1,8,3]\n",
        "]\n\n",
        "最小路径和为 11（2 -> 3 -> 5 -> 1）。",
      ].join(" ");
    },
    difficulty: 5,
    generate: (): number[][] => {
      const triangle: number[][] = [];
      const levels: number = getRandomIntInclusive(3, 12);
      triangle.length = levels;

      for (let row = 0; row < levels; ++row) {
        triangle[row] = [];
        triangle[row].length = row + 1;
        for (let i = 0; i < triangle[row].length; ++i) {
          triangle[row][i] = getRandomIntInclusive(1, 9);
        }
      }

      return triangle;
    },
    getAnswer: (data) => {
      const n: number = data.length;
      const dp: number[] = data[n - 1].slice();
      for (let i = n - 2; i > -1; --i) {
        for (let j = 0; j < data[i].length; ++j) {
          dp[j] = Math.min(dp[j], dp[j + 1]) + data[i][j];
        }
      }

      return dp[0];
    },
    solver: (data, answer) => {
      return minimumPathSumInATriangle[CodingContractName.MinimumPathSumInATriangle].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
