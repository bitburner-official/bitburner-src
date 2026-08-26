import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "../Enums";

export const subarrayWithMaximumSum: Pick<CodingContractTypes, CodingContractName.SubarrayWithMaximumSum> = {
  [CodingContractName.SubarrayWithMaximumSum]: {
    desc: (n: number[]): string => {
      return [
        "给定以下整数数组，找出具有最大和的连续子数组",
        "（至少包含一个数字），并返回该和。",
        "“和”指的是子数组中所有数字的总和。\n",
        `${n.toString()}`,
      ].join(" ");
    },
    difficulty: 1,
    generate: (): number[] => {
      const len: number = getRandomIntInclusive(5, 40);
      const arr: number[] = [];
      arr.length = len;
      for (let i = 0; i < len; ++i) {
        arr[i] = getRandomIntInclusive(-10, 10);
      }

      return arr;
    },
    getAnswer: (data) => {
      const nums: number[] = data.slice();
      for (let i = 1; i < nums.length; i++) {
        nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
      }

      return Math.max(...nums);
    },
    solver: (data, answer) => {
      return subarrayWithMaximumSum[CodingContractName.SubarrayWithMaximumSum].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
