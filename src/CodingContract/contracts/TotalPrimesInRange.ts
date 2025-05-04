import { CodingContractName } from "@enums";
import { removeBracketsFromArrayString, type CodingContractTypes } from "../ContractTypes";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { segmentedSieve } from "../../utils/PrimeSieve";

export const totalPrimesInRange: Pick<CodingContractTypes, CodingContractName.TotalPrimesInRange> = {
  [CodingContractName.TotalPrimesInRange]: {
    desc: (data: number[]): string => {
      return [
        `You are given two random non-negative integers: ${data}.\n`,
        `List the prime numbers between them (including the numbers given).\n`,
        `For example, given the range of [0,20], the primes in between are [2,3,5,7,11,13,17,19].`,
      ].join(" ");
    },
    difficulty: 2,
    generate: (): number[] => {
      //The total range of values across all contracts, and minimum range for each contract is intended to make a pre-generated array of primes impractical,
      //and naive approaches for checking every value for primality slower but possible if well written.
      const low = getRandomIntInclusive(0, 5e6);
      const high = low + getRandomIntInclusive(1e5, 1e6);
      return [low, high];
    },
    solver: (data, answer) => {
      //The result is converted to a set since set.has() is much faster than array.includes();
      const primes = new Set(segmentedSieve(data[0], data[1]));
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
