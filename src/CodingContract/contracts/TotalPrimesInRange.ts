import { CodingContractName } from "@enums";
import { removeBracketsFromArrayString, type CodingContractTypes } from "../ContractTypes";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { segmentedSieve } from "../../utils/PrimeSieve";

export const totalPrimesInRange: Pick<CodingContractTypes, CodingContractName.TotalPrimesInRange> = {
  [CodingContractName.TotalPrimesInRange]: {
    desc: (data: number[]): string => {
      return [
        "You are given two numbers. ",
        `List the prime numbers between them (including those given)\n`,
        `${data}\n`,
      ].join(" ");
    },
    difficulty: 2,
    generate: (): number[] => {
      //low end has a large range to discourage storage of a pre-generated array of primes
      const low = getRandomIntInclusive(1, 1e5);
      //high end has a minimum distance from low bound to make entry-by entry prime-checking possible but not ideal.
      const high = low + getRandomIntInclusive(1e3, 1e5);
      return [low, high];
    },
    solver: (data, answer) => {
      const primes = segmentedSieve(data[0], data[1]);
      return answer.length === primes.size && answer.every((a) => primes.has(a));
    },
    convertAnswer: (ans) => {
      const sanitized = removeBracketsFromArrayString(ans).replace(/\s/g, "").split(",");
      return sanitized.map((s) => parseInt(s));
    },
    validateAnswer: (ans): ans is number[] =>
      typeof ans === "object" && Array.isArray(ans) && ans.every((s) => typeof s === "number"),
  },
};
