import { CodingContractName } from "@enums";
import { type CodingContractTypes } from "../ContractTypes";
import { randomBigIntExclusive } from "../../utils/helpers/randomBigIntExclusive";

export const squareRoot: Pick<CodingContractTypes, CodingContractName.SquareRoot> = {
  [CodingContractName.SquareRoot]: {
    difficulty: 5,
    desc(data: bigint): string {
      return `给你一个约 200 位的大整数（BigInt）。请求出这个数的平方根，精确到最接近的整数。\n
输入是一个 BigInt 值。答案必须是表示解的 BigInt 值的字符串。末尾的 "n" 不属于该字符串。\n
提示：如果你遇到困难，可以参考 https://en.wikipedia.org/wiki/Methods_of_computing_square_roots

输入数字：
${data}`;
    },
    generate(): [string, string] {
      const half = BigInt(2 ** 332);
      // We will square this, meaning the result won't be uniformly distributed anymore.
      // That's OK, we never claimed that (just that it would be random).
      // We cap the low end to 2^332 so that the problem input is always in the range [2^664, 2^666) which is 200-201 digits.
      const ans = randomBigIntExclusive(half) + half;
      let offset: bigint;
      // The numbers x for which round(sqrt(x)) = n are the integer range [n^2 - n + 1, n^2 + n + 1)
      if (Math.random() >= 0.5) {
        // Half the time, we will test the edge cases
        offset = Math.random() >= 0.5 ? ans : 1n - ans;
      } else {
        offset = randomBigIntExclusive(ans + ans) + 1n - ans;
      }
      // Bigints can't be JSON serialized, so we use strings.
      return [ans.toString(), offset.toString()];
    },
    getData(state: [string, string]): bigint {
      const ans = BigInt(state[0]);
      return ans * ans + BigInt(state[1]);
    },
    getAnswer: () => {
      return null;
    },
    solver: (state, answer) => {
      return state[0] === answer.toString();
    },
    convertAnswer: (ans) => BigInt(ans),
    validateAnswer: (ans): ans is bigint => typeof ans === "bigint",
  },
};
