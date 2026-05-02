import { CodingContractName } from "../../../src/Enums";
import { largestRectangle } from "../../../src/CodingContract/contracts/LargestRectangle";

const contract = largestRectangle[CodingContractName.LargestRectangleInAMatrix];

describe("LargestRectangle", () => {
  test("empty matrix", () => {
    const data = Array.from({ length: 5 }, () => Array<0>(3).fill(0));
    expect(contract.desc(data)).toContain(`
[
  [0,0,0],
  [0,0,0],
  [0,0,0],
  [0,0,0],
  [0,0,0]
]
`);
    expect(contract.getAnswer(data)).toEqual([
      [0, 0],
      [4, 2],
    ]);
    expect(
      contract.solver(data, [
        [0, 0],
        [4, 2],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [4, 2],
        [0, 0],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [4, 0],
        [0, 2],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [0, 2],
        [4, 0],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [0, 0],
        [2, 4],
      ]),
    ).toBe(false);
    expect(
      contract.solver(data, [
        [0, 0],
        [1, 1],
      ]),
    ).toBe(false);
  });

  test("single one", () => {
    const data = Array.from({ length: 5 }, () => Array<0 | 1>(5).fill(0));
    data[1][1] = 1;
    expect(contract.desc(data)).toContain(`
[
  [0,0,0,0,0],
  [0,1,0,0,0],
  [0,0,0,0,0],
  [0,0,0,0,0],
  [0,0,0,0,0]
]
`);
    expect(contract.getAnswer(data)).toEqual([
      [2, 0],
      [4, 4],
    ]);
    expect(
      contract.solver(data, [
        [0, 2],
        [4, 4],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [4, 4],
        [0, 2],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [4, 2],
        [0, 4],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [0, 4],
        [4, 2],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [2, 0],
        [4, 4],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [1, 0],
        [4, 4],
      ]),
    ).toBe(false);
    expect(
      contract.solver(data, [
        [0, 0],
        [4, 4],
      ]),
    ).toBe(false);
    expect(
      contract.solver(data, [
        [-1, 2],
        [4, 4],
      ]),
    ).toBe(false);
  });
  test("single zero", () => {
    const data = Array.from({ length: 1 }, () => Array<0 | 1>(8).fill(1));
    data[0][3] = 0;
    expect(contract.desc(data)).toContain(`
[
  [1,1,1,0,1,1,1,1]
]
`);
    expect(contract.getAnswer(data)).toEqual([
      [0, 3],
      [0, 3],
    ]);
    expect(
      contract.solver(data, [
        [0, 3],
        [0, 3],
      ]),
    ).toBe(true);
    expect(
      contract.solver(data, [
        [0, 3],
        [0, 4],
      ]),
    ).toBe(false);
    expect(
      contract.solver(data, [
        [0, 2],
        [0, 3],
      ]),
    ).toBe(false);
    expect(
      contract.solver(data, [
        [0, 3],
        [1, 3],
      ]),
    ).toBe(false);
    expect(
      contract.solver(data, [
        [0, 0],
        [0, 7],
      ]),
    ).toBe(false);
  });
  test("generate doesn't return all ones", () => {
    const origRandom = Math.random;
    let calls = 0;
    const mockRandom = () => {
      if (calls++ < 100) {
        return 0;
      }
      return origRandom();
    };
    try {
      Math.random = mockRandom;
      expect(contract.generate().flat()).toContain(0);
    } finally {
      Math.random = origRandom;
    }
  });
});
