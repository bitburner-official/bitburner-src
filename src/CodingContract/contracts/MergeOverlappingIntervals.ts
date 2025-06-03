import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes, convert2DArrayToString, removeBracketsFromArrayString } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const mergeOverlappingIntervals: Pick<CodingContractTypes, CodingContractName.MergeOverlappingIntervals> = {
  [CodingContractName.MergeOverlappingIntervals]: {
    desc: (arr: number[][]): string => {
      return [
        "Given the following array of arrays of numbers representing a list of",
        "intervals, merge all overlapping intervals.\n\n",
        `[${convert2DArrayToString(arr)}]\n\n`,
        "Example:\n\n",
        "[[1, 3], [8, 10], [2, 6], [10, 16]]\n\n",
        "would merge into [[1, 6], [8, 16]].\n\n",
        "The intervals must be returned in ASCENDING order.",
        "You can assume that in an interval, the first number will always be",
        "smaller than the second.",
      ].join(" ");
    },
    difficulty: 3,
    generate: (): [number, number][] => {
      const intervals: [number, number][] = [];
      const numIntervals: number = getRandomIntInclusive(3, 20);
      for (let i = 0; i < numIntervals; ++i) {
        const start: number = getRandomIntInclusive(1, 25);
        const end: number = start + getRandomIntInclusive(1, 10);
        intervals.push([start, end]);
      }

      return intervals;
    },
    numTries: 15,
    solver: (data, answer) => {
      const intervals: [number, number][] = data.slice();
      intervals.sort((a: [number, number], b: [number, number]) => {
        return a[0] - b[0];
      });

      const result: [number, number][] = [];
      let start: number = intervals[0][0];
      let end: number = intervals[0][1];
      for (const interval of intervals) {
        if (interval[0] <= end) {
          end = Math.max(end, interval[1]);
        } else {
          result.push([start, end]);
          start = interval[0];
          end = interval[1];
        }
      }
      result.push([start, end]);

      return result.length === answer.length && result.every((a, i) => a[0] === answer[i][0] && a[1] === answer[i][1]);
    },
    convertAnswer: (ans) => {
      const arrayRegex = /\[\d+,\d+\]/g;
      const matches = ans.replace(/\s/g, "").match(arrayRegex);
      if (matches === null) return null;
      const arr = matches.map((a) =>
        removeBracketsFromArrayString(a)
          .split(",")
          .map((n) => parseInt(n)),
      );
      // An inline function is needed here, so that TS knows this returns true if it matches the type
      if (((a: number[][]): a is [number, number][] => a.every((n) => n.length === 2))(arr)) return arr;
      return null;
    },
    validateAnswer: (ans): ans is [number, number][] =>
      typeof ans === "object" &&
      Array.isArray(ans) &&
      ans.every((a) => Array.isArray(a) && a.length === 2 && a.every((n) => typeof n === "number")),
  },
};
