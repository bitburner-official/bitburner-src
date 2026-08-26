import { CodingContractName } from "@enums";
import { CodingContractTypes } from "../ContractTypes";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";

export const findLargestPrimeFactor: Pick<CodingContractTypes, CodingContractName.FindLargestPrimeFactor> = {
  [CodingContractName.FindLargestPrimeFactor]: {
    desc: (n: number): string => {
      return ["质因数是本身为质数的因数。", `${n} 的最大质因数是多少？`].join(
        " ",
      );
    },
    difficulty: 1,
    generate: (): number => {
      return getRandomIntInclusive(500, 1e9);
    },
    getAnswer: (data) => {
      let fac = 2;
      let n: number = data;
      while (n > (fac - 1) * (fac - 1)) {
        while (n % fac === 0) {
          n = Math.round(n / fac);
        }
        ++fac;
      }

      return n === 1 ? fac - 1 : n;
    },
    solver: (data, answer) => {
      return findLargestPrimeFactor[CodingContractName.FindLargestPrimeFactor].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
