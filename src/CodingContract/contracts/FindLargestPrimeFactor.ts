import { CodingContractName } from "@enums";
import { CodingContractTypes } from "../ContractTypes";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";

export const findLargestPrimeFactor: Pick<CodingContractTypes, CodingContractName.FindLargestPrimeFactor> = {
  [CodingContractName.FindLargestPrimeFactor]: {
    desc: (n: number): string => {
      return ["A prime factor is a factor that is a prime number.", `What is the largest prime factor of ${n}?`].join(
        " ",
      );
    },
    difficulty: 1,
    generate: (): number => {
      return getRandomIntInclusive(500, 1e9);
    },
    solver: (data, answer) => {
      let fac = 2;
      let n: number = data;
      while (n > (fac - 1) * (fac - 1)) {
        while (n % fac === 0) {
          n = Math.round(n / fac);
        }
        ++fac;
      }

      return (n === 1 ? fac - 1 : n) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
