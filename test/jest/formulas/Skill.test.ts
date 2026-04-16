import { calculateSkill, calculateExp } from "../../../src/PersonObjects/formulas/skill";

describe("calculateSkill", () => {
  test.each([...new Array(300).keys()])("Correct inverse %i", (skill: number) => {
    if (skill < 2) return; // There are special cases to be dealt with
    const xp1 = calculateExp(skill);
    expect(calculateSkill(xp1)).toBe(skill);
    expect(calculateSkill(xp1 * 0.999999999)).toBe(skill - 1);

    const xp2 = calculateExp(skill, 1.4);
    expect(calculateSkill(xp2, 1.4)).toBe(skill);
    expect(calculateSkill(xp2 * 0.999999999, 1.4)).toBe(skill - 1);

    if (skill < 4) return; // 3 is a special case for this mult
    const xp3 = calculateExp(skill, 3.3);
    expect(calculateSkill(xp3, 3.3)).toBe(skill);
    expect(calculateSkill(xp3 * 0.999999999, 3.3)).toBe(skill - 1);
    expect(calculateSkill(calculateExp(skill, 3.3), 3.3)).toBe(skill);
  });
  test("Special cases", () => {
    expect(() => calculateExp(NaN)).toThrow();
    expect(calculateExp(Infinity)).toBe(Number.MAX_VALUE);
    expect(calculateExp(-Infinity)).toBe(0);

    // In all these cases, the XP is clamped to 0. With a big enough mult,
    // this gets converted back to a larger skill.
    expect(calculateSkill(calculateExp(0))).toBe(1);
    expect(calculateSkill(calculateExp(0, 1.4), 1.4)).toBe(1);
    expect(calculateSkill(calculateExp(0, 3.3), 3.3)).toBe(3);
    expect(calculateSkill(calculateExp(1))).toBe(1);
    expect(calculateSkill(calculateExp(1, 1.4), 1.4)).toBe(1);
    expect(calculateSkill(calculateExp(1, 3.3), 3.3)).toBe(3);
  });
});
