import { getWeakenEffect } from "../../../src/Server/ServerHelpers";

describe("getWeakenEffect (formulas.hacking.weakenEffect)", () => {
  it("returns 0.05 per thread with single core", () => {
    expect(getWeakenEffect(1, 1)).toBe(0.05);
    expect(getWeakenEffect(100, 1)).toBe(5.0);
  });

  it("applies core bonus correctly", () => {
    // Core bonus: 1 + (cores - 1) / 16
    // 8 cores: 1 + 7/16 = 1.4375
    expect(getWeakenEffect(1, 8)).toBeCloseTo(0.071875);
    expect(getWeakenEffect(100, 8)).toBeCloseTo(7.1875);
  });

  it("returns 0 for 0 threads", () => {
    expect(getWeakenEffect(0, 1)).toBe(0);
  });

  it("handles single core (no bonus)", () => {
    // Core bonus with 1 core: 1 + 0/16 = 1.0
    expect(getWeakenEffect(50, 1)).toBe(2.5);
  });

  it("handles max cores (8)", () => {
    // 8 cores: 1 + 7/16 = 1.4375
    // 10 threads * 0.05 * 1.4375 = 0.71875
    expect(getWeakenEffect(10, 8)).toBeCloseTo(0.71875);
  });
});
