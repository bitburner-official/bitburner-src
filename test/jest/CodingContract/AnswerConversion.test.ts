import { CodingContractTypes, parseArrayString } from "../../../src/CodingContract/ContractTypes";
import { CodingContractName } from "../../../src/Enums";
import { getRecordEntries } from "../../../src/Types/Record";

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(jest.fn());
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("Utility functions", () => {
  test("parseArrayString", () => {
    expect(parseArrayString("")).toStrictEqual([]);
    expect(parseArrayString("[]")).toStrictEqual([]);

    expect(parseArrayString(`""`)).toStrictEqual([""]);
    expect(parseArrayString(`[""]`)).toStrictEqual([""]);
    expect(parseArrayString(`"foo"`)).toStrictEqual(["foo"]);
    expect(parseArrayString(`["foo"]`)).toStrictEqual(["foo"]);

    expect(parseArrayString("0")).toStrictEqual([0]);
    expect(parseArrayString("0,1")).toStrictEqual([0, 1]);
    expect(parseArrayString("[0,1]")).toStrictEqual([0, 1]);

    expect(parseArrayString(`[[]]`, true)).toStrictEqual([[]]);
    expect(parseArrayString(`[[0]]`, true)).toStrictEqual([[0]]);
    expect(parseArrayString(`[[0,1],[2,3]]`, true)).toStrictEqual([
      [0, 1],
      [2, 3],
    ]);

    // Incorrectly wrapped as documented
    expect(parseArrayString(`[ [0]]`, true)).toStrictEqual([[[0]]]);
    // Preprocessing redundant whitespace
    expect(parseArrayString(`[ [0]]`.replace(/\s/g, ""), true)).toStrictEqual([[0]]);
    // Return as-is as documented
    expect(parseArrayString(`[[1,2],3]`, true)).toStrictEqual([[1, 2], 3]);

    expect(parseArrayString("[")).toStrictEqual(null);
    expect(parseArrayString("]")).toStrictEqual(null);
    expect(parseArrayString("foo")).toStrictEqual(null);
  });
});

describe("Array", () => {
  for (const [name, cct] of getRecordEntries(CodingContractTypes)) {
    if (
      ![
        CodingContractName.FindAllValidMathExpressions,
        CodingContractName.GenerateIPAddresses,
        CodingContractName.MergeOverlappingIntervals,
        CodingContractName.Proper2ColoringOfAGraph,
        CodingContractName.SanitizeParenthesesInExpression,
        CodingContractName.SpiralizeMatrix,
        CodingContractName.LargestRectangleInAMatrix,
      ].includes(name)
    ) {
      continue;
    }
    test(name, () => {
      expect(cct.convertAnswer("[")).toStrictEqual(null);
      expect(cct.convertAnswer("]")).toStrictEqual(null);
    });
  }
});

describe("String array", () => {
  for (const [name, cct] of getRecordEntries(CodingContractTypes)) {
    if (
      ![
        CodingContractName.FindAllValidMathExpressions,
        CodingContractName.GenerateIPAddresses,
        CodingContractName.SanitizeParenthesesInExpression,
      ].includes(name)
    ) {
      continue;
    }
    test(name, () => {
      expect(cct.convertAnswer("")).toStrictEqual([]);
      expect(cct.convertAnswer("[]")).toStrictEqual([]);

      expect(cct.convertAnswer(`""`)).toStrictEqual([""]);
      expect(cct.convertAnswer(`[""]`)).toStrictEqual([""]);
      expect(cct.convertAnswer(`"",""`)).toStrictEqual(["", ""]);
      expect(cct.convertAnswer(`["",""]`)).toStrictEqual(["", ""]);
      expect(cct.convertAnswer(`"foo"`)).toStrictEqual(["foo"]);
      expect(cct.convertAnswer(`"foo","bar"`)).toStrictEqual(["foo", "bar"]);
      expect(cct.convertAnswer(` "foo",  "bar"   `)).toStrictEqual(["foo", "bar"]);

      expect(cct.convertAnswer(`"foo`)).toStrictEqual(null);
      expect(cct.convertAnswer(`foo"`)).toStrictEqual(null);
      expect(cct.convertAnswer(`'foo'`)).toStrictEqual(null);
      expect(cct.convertAnswer(`\`foo\``)).toStrictEqual(null);
    });
  }
});

describe("Number array", () => {
  for (const [name, cct] of getRecordEntries(CodingContractTypes)) {
    if (![CodingContractName.Proper2ColoringOfAGraph, CodingContractName.SpiralizeMatrix].includes(name)) {
      continue;
    }
    test(name, () => {
      expect(cct.convertAnswer("")).toStrictEqual([]);
      expect(cct.convertAnswer("[]")).toStrictEqual([]);

      expect(cct.convertAnswer("0")).toStrictEqual([0]);
      expect(cct.convertAnswer("[0]")).toStrictEqual([0]);
      expect(cct.convertAnswer("0,1")).toStrictEqual([0, 1]);
      expect(cct.convertAnswer("[0,1]")).toStrictEqual([0, 1]);
      expect(cct.convertAnswer("[ 0, 1]")).toStrictEqual([0, 1]);

      // Common issues with parseInt in old implementations of convertAnswer
      expect(cct.convertAnswer("123abc")).toStrictEqual(null);
      expect(cct.convertAnswer(`"0"`)).toStrictEqual(null);
      expect(cct.convertAnswer("null")).toStrictEqual(null);
      expect(cct.convertAnswer("undefined")).toStrictEqual(null);
      if (name !== CodingContractName.Proper2ColoringOfAGraph) {
        expect(cct.convertAnswer("12.34")).toStrictEqual([12.34]);
        expect(cct.convertAnswer("1e3")).toStrictEqual([1000]);
      }
    });
  }
});

describe("Array of arrays", () => {
  test(CodingContractName.MergeOverlappingIntervals, () => {
    const cct = CodingContractTypes[CodingContractName.MergeOverlappingIntervals];
    // "" => []. With the current generate() and getAnswer(), both data and answer cannot be empty arrays, but in
    // theory, if the input is an empty array, the output is also an empty array. The fact that the input cannot be an
    // empty array is only an implementation detail of the internal functions, so an empty array is still a potentially
    // correct answer.
    expect(cct.convertAnswer("")).toStrictEqual([]);
    // "[]" => []
    expect(cct.convertAnswer("[]")).toStrictEqual([]);

    expect(cct.convertAnswer("[0,0]")).toStrictEqual([[0, 0]]);
    expect(cct.convertAnswer("[0, 0]")).toStrictEqual([[0, 0]]);
    expect(cct.convertAnswer("[[0, 0]]")).toStrictEqual([[0, 0]]);
    expect(cct.convertAnswer("[ [0, 0]]")).toStrictEqual([[0, 0]]);
    expect(cct.convertAnswer("[1, 2], [3, 4]")).toStrictEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(cct.convertAnswer("[[1, 2], [3, 4]]")).toStrictEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(cct.convertAnswer("[[]]")).toStrictEqual(null);
  });
  test(CodingContractName.LargestRectangleInAMatrix, () => {
    const cct = CodingContractTypes[CodingContractName.LargestRectangleInAMatrix];
    expect(cct.convertAnswer("[0,0],[0,1]")).toStrictEqual([
      [0, 0],
      [0, 1],
    ]);
    expect(cct.convertAnswer("[[0,0],[0,1]]")).toStrictEqual([
      [0, 0],
      [0, 1],
    ]);
    expect(cct.convertAnswer("[ [0,0], [0,1]]")).toStrictEqual([
      [0, 0],
      [0, 1],
    ]);
    // "" => [], and an empty array is invalid.
    expect(cct.convertAnswer("")).toStrictEqual(null);
    // "[]" => [], and an empty array is invalid.
    expect(cct.convertAnswer("[]")).toStrictEqual(null);
    expect(cct.convertAnswer("[0,0]")).toStrictEqual(null);
    expect(cct.convertAnswer("[[]]")).toStrictEqual(null);
  });
});
