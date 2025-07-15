import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const algorithmicStockTrader: Pick<
  CodingContractTypes,
  | CodingContractName.AlgorithmicStockTraderI
  | CodingContractName.AlgorithmicStockTraderII
  | CodingContractName.AlgorithmicStockTraderIII
  | CodingContractName.AlgorithmicStockTraderIV
> = {
  [CodingContractName.AlgorithmicStockTraderI]: {
    desc: (data: number[]): string => {
      return [
        "You are given the following array of stock prices (which are numbers)",
        "where the i-th element represents the stock price on day i:\n\n",
        `${data}\n\n`,
        "Determine the maximum possible profit you can earn using at most",
        "one transaction (i.e. you can only buy and sell the stock once). If no profit can be made",
        "then the answer should be 0. Note",
        "that you have to buy the stock before you can sell it.",
      ].join(" ");
    },
    difficulty: 1,
    generate: (): number[] => {
      const len: number = getRandomIntInclusive(3, 50);
      const arr: number[] = [];
      arr.length = len;
      for (let i = 0; i < len; ++i) {
        arr[i] = getRandomIntInclusive(1, 200);
      }

      return arr;
    },
    numTries: 5,
    solver: (data, answer) => {
      let maxCur = 0;
      let maxSoFar = 0;
      for (let i = 1; i < data.length; ++i) {
        maxCur = Math.max(0, (maxCur += data[i] - data[i - 1]));
        maxSoFar = Math.max(maxCur, maxSoFar);
      }

      return maxSoFar === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.AlgorithmicStockTraderII]: {
    desc: (data: number[]): string => {
      return [
        "You are given the following array of stock prices (which are numbers)",
        "where the i-th element represents the stock price on day i:\n\n",
        `${data}\n\n`,
        "Determine the maximum possible profit you can earn using as many",
        "transactions as you'd like. A transaction is defined as buying",
        "and then selling one share of the stock. Note that you cannot",
        "engage in multiple transactions at once. In other words, you",
        "must sell the stock before you buy it again.\n\n",
        "If no profit can be made, then the answer should be 0.",
      ].join(" ");
    },
    difficulty: 2,
    generate: (): number[] => {
      const len: number = getRandomIntInclusive(3, 50);
      const arr: number[] = [];
      arr.length = len;
      for (let i = 0; i < len; ++i) {
        arr[i] = getRandomIntInclusive(1, 200);
      }

      return arr;
    },
    solver: (data, answer) => {
      let profit = 0;
      for (let p = 1; p < data.length; ++p) {
        profit += Math.max(data[p] - data[p - 1], 0);
      }

      return profit === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.AlgorithmicStockTraderIII]: {
    desc: (data: number[]): string => {
      return [
        "You are given the following array of stock prices (which are numbers)",
        "where the i-th element represents the stock price on day i:\n\n",
        `${data}\n\n`,
        "Determine the maximum possible profit you can earn using at most",
        "two transactions. A transaction is defined as buying",
        "and then selling one share of the stock. Note that you cannot",
        "engage in multiple transactions at once. In other words, you",
        "must sell the stock before you buy it again.\n\n",
        "If no profit can be made, then the answer should be 0.",
      ].join(" ");
    },
    difficulty: 4,
    generate: (): number[] => {
      const len: number = getRandomIntInclusive(3, 50);
      const arr: number[] = [];
      arr.length = len;
      for (let i = 0; i < len; ++i) {
        arr[i] = getRandomIntInclusive(1, 200);
      }

      return arr;
    },
    solver: (data, answer) => {
      let hold1 = Number.MIN_SAFE_INTEGER;
      let hold2 = Number.MIN_SAFE_INTEGER;
      let release1 = 0;
      let release2 = 0;
      for (const price of data) {
        release2 = Math.max(release2, hold2 + price);
        hold2 = Math.max(hold2, release1 - price);
        release1 = Math.max(release1, hold1 + price);
        hold1 = Math.max(hold1, price * -1);
      }

      return release2 === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.AlgorithmicStockTraderIV]: {
    desc: (data: [number, number[]]): string => {
      const k = data[0];
      const prices = data[1];
      return [
        "You are given the following array with two elements:\n\n",
        `[${k}, [${prices}]]\n\n`,
        "The first element is an integer k. The second element is an",
        "array of stock prices (which are numbers) where the i-th element",
        "represents the stock price on day i.\n\n",
        "Determine the maximum possible profit you can earn using at most",
        "k transactions. A transaction is defined as buying and then selling",
        "one share of the stock. Note that you cannot engage in multiple",
        "transactions at once. In other words, you must sell the stock before",
        "you can buy it again.\n\n",
        "If no profit can be made, then the answer should be 0.",
      ].join(" ");
    },
    difficulty: 8,
    generate: (): [number, number[]] => {
      const k = getRandomIntInclusive(2, 10);
      const len = getRandomIntInclusive(3, 50);
      const prices: number[] = [];
      prices.length = len;
      for (let i = 0; i < len; ++i) {
        prices[i] = getRandomIntInclusive(1, 200);
      }

      return [k, prices];
    },
    solver: (data, answer) => {
      const k: number = data[0];
      const prices: number[] = data[1];

      const len = prices.length;
      if (len < 2) {
        return answer === 0;
      }
      if (k > len / 2) {
        let res = 0;
        for (let i = 1; i < len; ++i) {
          res += Math.max(prices[i] - prices[i - 1], 0);
        }

        return res === answer;
      }

      const hold: number[] = [];
      const rele: number[] = [];
      hold.length = k + 1;
      rele.length = k + 1;
      for (let i = 0; i <= k; ++i) {
        hold[i] = Number.MIN_SAFE_INTEGER;
        rele[i] = 0;
      }

      let cur: number;
      for (let i = 0; i < len; ++i) {
        cur = prices[i];
        for (let j = k; j > 0; --j) {
          rele[j] = Math.max(rele[j], hold[j] + cur);
          hold[j] = Math.max(hold[j], rele[j - 1] - cur);
        }
      }

      return rele[k] === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
