import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const largestRectangle: Pick<CodingContractTypes, CodingContractName.LargestRectangleIHistogram> = {
  [CodingContractName.LargestRectangleIHistogram]: {
    desc: (data: number[]): string => {
      let gridString = "";
      for (const line of data) {
        gridString += `${line.toString()},`;
      }
      return [
        "HISTOGRAM TAMEPLATE 279 279 279:\n\n",
        `  [${gridString}]\n\n`,

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
    difficulty: 3, //for now
    generate: (): number[] => {
      const numRows: number = getRandomIntInclusive(5, 30);

      const grid: number[] = [];
      grid.length = numRows;
      for (let i = 0; i < numRows; ++i) {
        grid[i] = getRandomIntInclusive(0, 9);
      }

      return grid;
    },
    getAnswer: (data) => {
      return null;
    },
    solver: (data, answer) => {
      if (answer[0] < 0 || answer[1] > data.length) return false;
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
            maxArea = (right - left + 1) * data[i];
          }
        }
      }

      const userSubstring = data.slice(answer[0], answer[1] + 1);
      const userMin = Math.min(...userSubstring);
      const userArea = userMin * userSubstring.length;

      return userArea >= maxArea;
    },
    convertAnswer: (ans) => {
      try {
        const parsed = JSON.parse(ans);
        if (
          Array.isArray(parsed) &&
          parsed.length === 2 &&
          typeof parsed[0] === "number" &&
          typeof parsed[1] === "number"
        ) {
          return [parsed[0], parsed[1]];
        }
        return null;
      } catch {
        return null;
      }
    },
    validateAnswer: (ans): ans is [number, number] => {
      return ans != null;
    },
  },
};
//   [CodingContractName.LargestRectangleIIMatrix]: {
//     desc: (data: number[][]): string => {
//       return [
//         "MATRIX TAMEPLATE 279 279 279:\n\n",
//         `  [${data.map((line) => `[${line}]`).join(",\n   ")}]\n\n`,
 
//         "Examples:\n\n",
//         "    [[0,1,0,0,0],\n",
//         "     [0,0,0,1,0]]\n",
//         "\n",
//         "Answer: '[[0,0],[0,1]]'\n\n",
//         "    [[0,1],\n",
//         "     [1,0]]\n",
//         "\n",
//         "Answer: '[[0,0],[0,0]]'",
//       ].join(" ");
//     },
//     difficulty: 7,
//     generate: (): (1 | 0)[][] => {
//       const numRows: number = getRandomIntInclusive(4, 15);
//       const numColumns: number = getRandomIntInclusive(4, 15);

//       const grid: (1 | 0)[][] = [];
//       grid.length = numRows;
//       for (let i = 0; i < numRows; ++i) {
//         grid[i] = [];
//         grid[i].length = numColumns;
//         grid[i].fill(0);
//       }

//       for (let r = 0; r < numRows; ++r) {
//         for (let c = 0; c < numColumns; ++c) {
//           if (r === 0 && c === 0) {
//             continue;
//           }
//           if (r === numRows - 1 && c === numColumns - 1) {
//             continue;
//           }

//           // 15% chance of an element being an obstacle
//           if (Math.random() < 0.15) {
//             grid[r][c] = 1;
//           }
//         }
//       }

//       return grid;
//     },
//     getAnswer: () => {
//       return null;
//     },
//     solver: (data, answer) => {
//       const width = data[0].length;
//       const height = data.length;
//       const dstY = height - 1;
//       const dstX = width - 1;

//       const distance: number[][] = new Array<number[]>(height);
//       //const prev: [[number, number] | undefined][] = new Array(height);
//       const queue: [number, number][] = [];

//       for (let y = 0; y < height; y++) {
//         distance[y] = new Array<number>(width).fill(Infinity);
//         //prev[y] = new Array(width).fill(undefined) as [undefined];
//       }

//       function validPosition(y: number, x: number): boolean {
//         return y >= 0 && y < height && x >= 0 && x < width && data[y][x] == 0;
//       }

//       // List in-bounds and passable neighbors
//       function* neighbors(y: number, x: number): Generator<[number, number]> {
//         if (validPosition(y - 1, x)) yield [y - 1, x]; // Up
//         if (validPosition(y + 1, x)) yield [y + 1, x]; // Down
//         if (validPosition(y, x - 1)) yield [y, x - 1]; // Left
//         if (validPosition(y, x + 1)) yield [y, x + 1]; // Right
//       }

//       // Prepare starting point
//       distance[0][0] = 0;
//       queue.push([0, 0]);

//       // Take next-nearest position and expand potential paths from there
//       while (queue.length > 0) {
//         const [y, x] = queue.shift() as [number, number];
//         for (const [yN, xN] of neighbors(y, x)) {
//           if (distance[yN][xN] == Infinity) {
//             queue.push([yN, xN]);
//             distance[yN][xN] = distance[y][x] + 1;
//           }
//         }
//       }

//       if (!Number.isFinite(distance[dstY][dstX])) return answer === "";
//       if (answer.length > distance[dstY][dstX]) return false;

//       let ansX = 0;
//       let ansY = 0;
//       for (const direction of answer.split("")) {
//         switch (direction) {
//           case "U":
//             ansY -= 1;
//             break;
//           case "D":
//             ansY += 1;
//             break;
//           case "L":
//             ansX -= 1;
//             break;
//           case "R":
//             ansX += 1;
//             break;
//           default:
//             return false;
//         }
//       }

//       return ansX === dstX && ansY === dstY;
//     },
//     convertAnswer: (ans) => ans.replace(/\s/g, ""),
//     validateAnswer: (ans): ans is string =>
//       typeof ans === "string" && ans.split("").every((c) => ["U", "D", "L", "R"].includes(c)),
//   }

