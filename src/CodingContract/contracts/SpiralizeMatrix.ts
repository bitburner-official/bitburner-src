import { CodingContractName } from "@enums";
import { removeBracketsFromArrayString, type CodingContractTypes } from "../ContractTypes";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";

export const spiralizeMatrix: Pick<CodingContractTypes, CodingContractName.SpiralizeMatrix> = {
  [CodingContractName.SpiralizeMatrix]: {
    desc: (n: number[][]): string => {
      let d: string = [
        "Given the following array of arrays of numbers representing a 2D matrix,",
        "return the elements of the matrix as an array in spiral order:\n\n",
      ].join(" ");
      // for (const line of n) {
      //   d += `${line.toString()},\n`;
      // }
      d += "    [\n";
      d += n
        .map((line: number[]) => "        [" + line.map((x: number) => `${x}`.padStart(2, " ")).join(",") + "]")
        .join("\n");
      d += "\n    ]\n";
      d += [
        "\nHere is an example of what spiral order should be:\n\n",
        "    [\n",
        "        [1, 2, 3]\n",
        "        [4, 5, 6]\n",
        "        [7, 8, 9]\n",
        "    ]\n\n",
        "Answer: [1, 2, 3, 6, 9, 8 ,7, 4, 5]\n\n",
        "Note that the matrix will not always be square:\n\n",
        "    [\n",
        "        [1,  2,  3,  4]\n",
        "        [5,  6,  7,  8]\n",
        "        [9, 10, 11, 12]\n",
        "    ]\n\n",
        "Answer: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]",
      ].join(" ");

      return d;
    },
    difficulty: 2,
    generate: (): number[][] => {
      const m: number = getRandomIntInclusive(1, 15);
      const n: number = getRandomIntInclusive(1, 15);
      const matrix: number[][] = [];
      matrix.length = m;
      for (let i = 0; i < m; ++i) {
        matrix[i] = [];
        matrix[i].length = n;
      }

      for (let i = 0; i < m; ++i) {
        for (let j = 0; j < n; ++j) {
          matrix[i][j] = getRandomIntInclusive(1, 50);
        }
      }

      return matrix;
    },
    solver: (data, answer) => {
      const spiral: number[] = [];
      const m: number = data.length;
      const n: number = data[0].length;
      let u = 0;
      let d: number = m - 1;
      let l = 0;
      let r: number = n - 1;
      let k = 0;
      let done = false;
      while (!done) {
        // Up
        for (let col: number = l; col <= r; col++) {
          spiral[k] = data[u][col];
          ++k;
        }
        if (++u > d) {
          done = true;
          continue;
        }

        // Right
        for (let row: number = u; row <= d; row++) {
          spiral[k] = data[row][r];
          ++k;
        }
        if (--r < l) {
          done = true;
          continue;
        }

        // Down
        for (let col: number = r; col >= l; col--) {
          spiral[k] = data[d][col];
          ++k;
        }
        if (--d < u) {
          done = true;
          continue;
        }

        // Left
        for (let row: number = d; row >= u; row--) {
          spiral[k] = data[row][l];
          ++k;
        }
        if (++l > r) {
          done = true;
          continue;
        }
      }

      return spiral.length === answer.length && spiral.every((n, i) => n === answer[i]);
    },
    convertAnswer: (ans) => {
      const sanitized = removeBracketsFromArrayString(ans).replace(/\s/g, "").split(",");
      return sanitized.map((s) => parseInt(s));
    },
    validateAnswer: (ans): ans is number[] =>
      typeof ans === "object" && Array.isArray(ans) && ans.every((n) => typeof n === "number"),
  },
};
