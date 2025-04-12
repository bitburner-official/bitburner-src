import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "../Enums";

export const subarrayWithMaximumSum: Pick<CodingContractTypes, CodingContractName.SubarrayWithMaximumSum> = {
  [CodingContractName.SubarrayWithMaximumSum]: {
    desc: (n: number[]): string => {
      return [
        "Given the following integer array, find the contiguous subarray",
        "(containing at least one number) which has the largest sum and return that sum.",
        "'Sum' refers to the sum of all the numbers in the subarray.\n",
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
    solver: (data, answer) => {
      const nums: number[] = data.slice();
      for (let i = 1; i < nums.length; i++) {
        nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
      }

      return Math.max(...nums) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
