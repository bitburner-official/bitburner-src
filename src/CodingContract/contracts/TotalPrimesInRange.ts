import { CodingContractName } from "@enums";
import { CodingContractTypes } from "../ContractTypes";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";

export const totalPrimesInRange: Pick<CodingContractTypes, CodingContractName.TotalPrimesInRange> = {
  [CodingContractName.TotalPrimesInRange]: {
    desc: (data: number[]): string => {
      return [
        `You are given two random non-negative integers: ${data}.\n`,
        `The first will be up to 5000000, and the second will be at most 1000000 greater.\n`,
        `Determine the amount of prime numbers between them (including the numbers given).\n\n`,
        "Example:\n",
        `The range of [0,20] contains the primes [2,3,5,7,11,13,17,19], resulting in an answer of 8.`,
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
      /** Simple implementation of Sieve of Eratosthenes
       * https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes*/
      function simpleSieve(max: number): number[] {
        const primes: number[] = [];
        //The array of numbers to check if they're prime is left blank. Blank and resulting prime values are falsey, non-primes are marked truthy.
        const arr = Array(max);
        //We only need to check factors up to the square root of max
        for (let i = 2; i * i <= max; i++) {
          //and only the prime factors
          if (!arr[i]) {
            //and we can then mark off all subsequent multiples of that prime
            for (let p = i * i; p <= max; p += i) {
              arr[p] = 1;
            }
          }
        }
        //It should be faster to loop over the array again than to check factors all the way to max and mark primes at the same time.
        for (let i = 2; i <= max; i++) {
          if (!arr[i]) {
            primes.push(i);
          }
        }
        return primes;
      }

      /** Modified Sieve of Eratosthenes to find primes across a range, rather than all primes below a value.*/
      function primeSieve(low: number, high: number): number {
        //0 and 1 are not checked, so are removed here.
        if (low < 2) {
          low = 2;
        }
        let primes: number = 0;
        //Only store the potential primes in the low to high range instead of 0 to high.
        const arr = Array(high - low + 1);
        //In order to mark off all composite numbers, we need to run up through sqrt(high), since primes squares are the worst case.
        const checks = simpleSieve(Math.ceil(Math.sqrt(high)));
        for (const i of checks) {
          //same logic as for the simple sieve to mark off multiples of identified primes, but we only start checking at the first multiple>=low.
          const lim = Math.max(i, Math.ceil(low / i)) * i;
          for (let j = lim; j <= high; j += i) {
            arr[j - low] = 1;
          }
        }
        for (let a = 0; a <= high - low; a++) {
          if (!arr[a]) {
            //We don't really care what the value of the prime is, just how many we find.
            ++primes;
          }
        }
        return primes;
      }

      //We trust the player generated the appropriate list of primes (or is more accurate at guessing primes than Gauss was at this range) and as such they deserve the reward.
      const primes = primeSieve(data[0], data[1]);
      return answer === primes;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
