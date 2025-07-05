import { CodingContractName } from "@enums";
import { CodingContractSignatures } from "@nsdefs";

import { algorithmicStockTrader } from "./contracts/AlgorithmicStockTrader";
import { arrayJumpingGame } from "./contracts/ArrayJumpingGame";
import { compression } from "./contracts/Compression";
import { encryption } from "./contracts/Encryption";
import { findAllValidMathExpressions } from "./contracts/FindAllValidMathExpressions";
import { findLargestPrimeFactor } from "./contracts/FindLargestPrimeFactor";
import { generateIPAddresses } from "./contracts/GenerateIPAddresses";
import { hammingCode } from "./contracts/HammingCode";
import { mergeOverlappingIntervals } from "./contracts/MergeOverlappingIntervals";
import { minimumPathSumInATriangle } from "./contracts/MinimumPathSumInATriangle";
import { proper2ColoringOfAGraph } from "./contracts/Proper2ColoringOfAGraph";
import { sanitizeParenthesesInExpression } from "./contracts/SanitizeParenthesesInExpression";
import { shortestPathInAGrid } from "./contracts/ShortestPathInAGrid";
import { spiralizeMatrix } from "./contracts/SpiralizeMatrix";
import { squareRoot } from "./contracts/SquareRoot";
import { subarrayWithMaximumSum } from "./contracts/SubarrayWithMaximumSum";
import { totalPrimesInRange } from "./contracts/TotalPrimesInRange";
import { totalWaysToSum } from "./contracts/TotalWaysToSum";
import { uniquePathsInAGrid } from "./contracts/UniquePathsInAGrid";

// This is the base interface, but should not be used for
// typechecking individual entries. Use the two types below for that.
interface CodingContractType<Data, Answer, State = Data> {
  /**
   * Function that returns a string with the problem's description.
   * Requires the 'data' of a Contract as input
   */
  desc: (data: Data) => string;
  /** Difficulty of the contract. Higher is harder. */
  difficulty: number;
  /** Function that generates a valid 'state' for a contract type */
  generate: () => State;
  /**
   * Transforms the 'state' for a contract into its 'data'. The state is
   * stored persistently as JSON, so it must be serializable. The data is what
   * is given to the user and shown in the description. If this function is
   * ommitted, it will be the identity function (i.e. State == Data).
   * You can use this to make problems where the "solver" is not a function
   * that can be copy-pasted to user code to solve the problem.
   */
  getData?: (state: State) => Data;
  /** How many tries you get. Defaults to 10. */
  numTries?: number;
  /** Function that checks whether the players answer is correct. */
  solver: (state: State, answer: Answer) => boolean;
  /** Function that converts string answers to the expected answer format. */
  convertAnswer: (answer: string) => Answer | null;
  /** Function that validates the format of the provided answer. */
  validateAnswer: (answer: unknown) => answer is Answer;
}

// This simple alias uses State == Data, and omits getData since it won't be used in this case.
type CodingContractSimpleType<Data, Answer> = Omit<CodingContractType<Data, Answer, Data>, "getData">;

// This alias has unique State and Data, and requires getData.
type CodingContractComplexType<Data, Answer, State> = Omit<CodingContractType<Data, Answer, State>, "getData"> & {
  getData: (state: State) => Data;
};

type CodingContractDefinitions<Signatures extends Record<string, [unknown, unknown] | [unknown, unknown, unknown]>> = {
  [T in keyof Signatures]: Signatures[T] extends [unknown, unknown, unknown]
    ? CodingContractComplexType<Signatures[T][0], Signatures[T][1], Signatures[T][2]>
    : CodingContractSimpleType<Signatures[T][0], Signatures[T][1]>;
};
export type CodingContractTypes = CodingContractDefinitions<CodingContractSignatures>;

/* Helper functions for Coding Contract implementations */
export function removeBracketsFromArrayString(str: string): string {
  let strCpy: string = str;
  if (strCpy.startsWith("[")) {
    strCpy = strCpy.slice(1);
  }
  if (strCpy.endsWith("]")) {
    strCpy = strCpy.slice(0, -1);
  }

  return strCpy;
}

export function removeQuotesFromString(str: string): string {
  let strCpy: string = str;
  if (strCpy.startsWith('"') || strCpy.startsWith("'")) {
    strCpy = strCpy.slice(1);
  }
  if (strCpy.endsWith('"') || strCpy.endsWith("'")) {
    strCpy = strCpy.slice(0, -1);
  }

  return strCpy;
}

export function convert2DArrayToString(arr: number[][]): string {
  const components: string[] = [];
  for (const e of arr) {
    let s = String(e);
    s = ["[", s, "]"].join("");
    components.push(s);
  }

  return components.join(",").replace(/\s/g, "");
}

export const CodingContractDefinitions: CodingContractTypes = {
  ...algorithmicStockTrader,
  ...arrayJumpingGame,
  ...compression,
  ...encryption,
  ...findAllValidMathExpressions,
  ...findLargestPrimeFactor,
  ...generateIPAddresses,
  ...hammingCode,
  ...mergeOverlappingIntervals,
  ...minimumPathSumInATriangle,
  ...proper2ColoringOfAGraph,
  ...totalPrimesInRange,
  ...sanitizeParenthesesInExpression,
  ...shortestPathInAGrid,
  ...spiralizeMatrix,
  ...squareRoot,
  ...subarrayWithMaximumSum,
  ...totalWaysToSum,
  ...uniquePathsInAGrid,
};

// This untyped variant is easier to work with when the specific type is not known.
// The specific shape is already checked by the CodingContractDefinitions type, so it is safe to assert the type.
export const CodingContractTypes = CodingContractDefinitions as Record<
  CodingContractName,
  CodingContractType<unknown, unknown, unknown>
>;
