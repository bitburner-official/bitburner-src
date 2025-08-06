import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const arrayJumpingGame: Pick<
  CodingContractTypes,
  CodingContractName.ArrayJumpingGame | CodingContractName.ArrayJumpingGameII
> = {
  [CodingContractName.ArrayJumpingGame]: {
    desc: (arr: number[]): string => {
      return [
        "You are given the following array of integers:\n\n",
        `${arr}\n\n`,
        "Each element in the array represents your MAXIMUM jump length",
        "at that position. This means that if you are at position i and your",
        "maximum jump length is n, you can jump to any position from",
        "i to i+n.",
        "\n\nAssuming you are initially positioned",
        "at the start of the array, determine whether you are",
        "able to reach the last index.\n\n",
        "Your answer should be submitted as 1 or 0, representing true and false respectively.",
      ].join(" ");
    },
    difficulty: 2,
    generate: (): number[] => {
      const len: number = getRandomIntInclusive(3, 25);
      const arr: number[] = [];
      arr.length = len;
      for (let i = 0; i < arr.length; ++i) {
        if (Math.random() < 0.2) {
          arr[i] = 0; // 20% chance of being 0
        } else {
          arr[i] = getRandomIntInclusive(0, 10);
        }
      }

      return arr;
    },
    numTries: 1,
    solver: (data, answer) => {
      const n: number = data.length;
      let i = 0;
      for (let reach = 0; i < n && i <= reach; ++i) {
        reach = Math.max(i + data[i], reach);
      }
      const solution: boolean = i === n;
      return (solution ? 1 : 0) === answer;
    },
    convertAnswer: (ans) => {
      const num = parseInt(ans);
      if (num === 0 || num === 1) return num;
      return null;
    },
    validateAnswer: (ans): ans is 1 | 0 => typeof ans === "number" && (ans === 0 || ans === 1),
  },
  [CodingContractName.ArrayJumpingGameII]: {
    desc: (arr: number[]): string => {
      return [
        "You are given the following array of integers:\n\n",
        `${arr}\n\n`,
        "Each element in the array represents your MAXIMUM jump length",
        "at that position. This means that if you are at position i and your",
        "maximum jump length is n, you can jump to any position from",
        "i to i+n.",
        "\n\nAssuming you are initially positioned",
        "at the start of the array, determine the minimum number of",
        "jumps to reach the last index.\n\n",
        "If it's impossible to reach the last index, then the answer should be 0.",
      ].join(" ");
    },
    difficulty: 3,
    generate: (): number[] => {
      const len: number = getRandomIntInclusive(3, 25);
      const arr: number[] = [];
      arr.length = len;
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < 10; j++) {
          if (Math.random() <= j / 10 + 0.1) {
            arr[i] = j;
            break;
          }
        }
      }

      return arr;
    },
    numTries: 3,
    solver: (data, answer) => {
      const n: number = data.length;
      let reach = 0;
      let jumps = 0;
      let lastJump = -1;
      while (reach < n - 1) {
        let jumpedFrom = -1;
        for (let i = reach; i > lastJump; i--) {
          if (i + data[i] > reach) {
            reach = i + data[i];
            jumpedFrom = i;
          }
        }
        if (jumpedFrom === -1) {
          jumps = 0;
          break;
        }
        lastJump = jumpedFrom;
        jumps++;
      }
      return jumps === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
