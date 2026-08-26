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
        "给你以下股票价格数组（均为数字），",
        "其中第 i 个元素表示第 i 天的股票价格：\n\n",
        `[${data}]\n\n`,
        "请计算你在最多进行一次交易（即只能买入并卖出股票一次）的情况下",
        "能获得的最大利润。如果无法获利，",
        "则答案应为 0。注意，",
        "你必须先买入股票才能卖出它。",
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
    getAnswer: (data) => {
      let maxCur = 0;
      let maxSoFar = 0;
      for (let i = 1; i < data.length; ++i) {
        maxCur = Math.max(0, (maxCur += data[i] - data[i - 1]));
        maxSoFar = Math.max(maxCur, maxSoFar);
      }
      return maxSoFar;
    },
    solver: (data, answer) => {
      return algorithmicStockTrader[CodingContractName.AlgorithmicStockTraderI].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.AlgorithmicStockTraderII]: {
    desc: (data: number[]): string => {
      return [
        "给你以下股票价格数组（均为数字），",
        "其中第 i 个元素表示第 i 天的股票价格：\n\n",
        `[${data}]\n\n`,
        "请计算你在进行任意多次交易的情况下",
        "能获得的最大利润。一次交易定义为买入",
        "然后卖出一股股票。注意你不能",
        "同时进行多笔交易。换句话说，你",
        "必须在再次买入之前卖出股票。\n\n",
        "如果无法获利，则答案应为 0。",
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
    getAnswer: (data) => {
      let profit = 0;
      for (let p = 1; p < data.length; ++p) {
        profit += Math.max(data[p] - data[p - 1], 0);
      }

      return profit;
    },
    solver: (data, answer) => {
      return algorithmicStockTrader[CodingContractName.AlgorithmicStockTraderII].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.AlgorithmicStockTraderIII]: {
    desc: (data: number[]): string => {
      return [
        "给你以下股票价格数组（均为数字），",
        "其中第 i 个元素表示第 i 天的股票价格：\n\n",
        `[${data}]\n\n`,
        "请计算你在最多进行两次交易的情况下",
        "能获得的最大利润。一次交易定义为买入",
        "然后卖出一股股票。注意你不能",
        "同时进行多笔交易。换句话说，你",
        "必须在再次买入之前卖出股票。\n\n",
        "如果无法获利，则答案应为 0。",
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
    getAnswer: (data) => {
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

      return release2;
    },
    solver: (data, answer) => {
      return algorithmicStockTrader[CodingContractName.AlgorithmicStockTraderIII].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.AlgorithmicStockTraderIV]: {
    desc: (data: [number, number[]]): string => {
      const k = data[0];
      const prices = data[1];
      return [
        "给你以下包含两个元素的数组：\n\n",
        `[${k}, [${prices}]]\n\n`,
        "第一个元素是整数 k。第二个元素是",
        "股票价格数组（均为数字），其中第 i 个元素",
        "表示第 i 天的股票价格。\n\n",
        "请计算你在最多进行 k 次交易的情况下",
        "能获得的最大利润。一次交易定义为买入然后卖出",
        "一股股票。注意你不能同时进行多笔",
        "交易。换句话说，你必须先卖出股票，",
        "才能再次买入。\n\n",
        "如果无法获利，则答案应为 0。",
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
    getAnswer: (data) => {
      const k: number = data[0];
      const prices: number[] = data[1];

      const len = prices.length;
      if (len < 2) {
        return 0;
      }
      if (k > len / 2) {
        let res = 0;
        for (let i = 1; i < len; ++i) {
          res += Math.max(prices[i] - prices[i - 1], 0);
        }

        return res;
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

      return rele[k];
    },
    solver: (data, answer) => {
      return algorithmicStockTrader[CodingContractName.AlgorithmicStockTraderIV].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
