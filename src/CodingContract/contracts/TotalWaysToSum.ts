import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const totalWaysToSum: Pick<
  CodingContractTypes,
  CodingContractName.TotalWaysToSum | CodingContractName.TotalWaysToSumII
> = {
  [CodingContractName.TotalWaysToSum]: {
    desc: (n: number): string => {
      return [
        "把 4 写成和的形式恰好有四种不同的方式：\n\n",
        "    3 + 1\n",
        "    2 + 2\n",
        "    2 + 1 + 1\n",
        "    1 + 1 + 1 + 1\n\n",
        `数字 ${n} 可以用多少种不同的方式写成至少`,
        "两个正整数的和？",
      ].join(" ");
    },
    difficulty: 1,
    generate: (): number => {
      return getRandomIntInclusive(8, 100);
    },
    getAnswer: (data) => {
      if (typeof data !== "number") throw new Error("solver expected number");
      const ways: number[] = [1];
      ways.length = data + 1;
      ways.fill(0, 1);
      for (let i = 1; i < data; ++i) {
        for (let j: number = i; j <= data; ++j) {
          ways[j] += ways[j - i];
        }
      }

      return ways[data];
    },
    solver: (data, answer) => {
      return totalWaysToSum[CodingContractName.TotalWaysToSum].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.TotalWaysToSumII]: {
    desc: (data: [number, number[]]): string => {
      const n: number = data[0];
      const s: number[] = data[1];
      return [
        `数字 ${n} 可以用多少种不同的方式写成由集合中的整数相加得到的和：\n\n`,
        `[${s}]？\n\n`,
        "集合中的每个整数都可以使用零次或多次。",
      ].join(" ");
    },
    difficulty: 2,
    generate: (): [number, number[]] => {
      const n: number = getRandomIntInclusive(12, 200);
      const maxLen: number = getRandomIntInclusive(8, 12);
      const s: number[] = [];
      // Bias towards small numbers is intentional to have much bigger answers in general
      // to force people better optimize their solutions
      for (let i = 1; i <= n; i++) {
        if (s.length == maxLen) {
          break;
        }
        if (Math.random() < 0.6 || n - i < maxLen - s.length) {
          s.push(i);
        }
      }
      return [n, s];
    },
    getAnswer: (data) => {
      // https://www.geeksforgeeks.org/coin-change-dp-7/?ref=lbp
      const n = data[0];
      const s = data[1];
      const ways: number[] = [1];
      ways.length = n + 1;
      ways.fill(0, 1);
      for (let i = 0; i < s.length; i++) {
        for (let j = s[i]; j <= n; j++) {
          ways[j] += ways[j - s[i]];
        }
      }
      return ways[n];
    },
    solver: (data, answer) => {
      return totalWaysToSum[CodingContractName.TotalWaysToSumII].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
