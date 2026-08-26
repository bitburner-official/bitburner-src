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
        "给你以下整数数组：\n\n",
        `${arr}\n\n`,
        "数组中的每个元素表示你在该位置的最大跳跃长度。",
        "也就是说，如果你位于位置 i，且你的",
        "最大跳跃长度为 n，那么你可以跳到从",
        "i 到 i+n 的任意位置。",
        "\n\n假设你最初位于数组的起始位置，请判断你是否",
        "能够到达最后一个下标。\n\n",
        "你的答案应以 1 或 0 提交，分别代表真和假。",
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
    getAnswer: (data) => {
      const n: number = data.length;
      let i = 0;
      for (let reach = 0; i < n && i <= reach; ++i) {
        reach = Math.max(i + data[i], reach);
      }
      const solution: boolean = i === n;
      return solution ? 1 : 0;
    },
    solver: (data, answer) => {
      return arrayJumpingGame[CodingContractName.ArrayJumpingGame].getAnswer(data) === answer;
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
        "给你以下整数数组：\n\n",
        `${arr}\n\n`,
        "数组中的每个元素表示你在该位置的最大跳跃长度。",
        "也就是说，如果你位于位置 i，且你的",
        "最大跳跃长度为 n，那么你可以跳到从",
        "i 到 i+n 的任意位置。",
        "\n\n假设你最初位于数组的起始位置，请计算到达最后一个下标所需的",
        "最少跳跃次数。\n\n",
        "如果无法到达最后一个下标，则答案应为 0。",
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
    getAnswer: (data) => {
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
      return jumps;
    },
    solver: (data, answer) => {
      return arrayJumpingGame[CodingContractName.ArrayJumpingGameII].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
