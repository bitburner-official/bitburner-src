import { OperationTeam } from "../../../src/Bladeburner/Bladeburner";

jest.mock("../../../src/utils/helpers/getRandomIntInclusive");

import {
  CasualtyReport,
  KillBladeburnerCasualties,
  OperationCasualtyOutcome,
} from "../../../src/Bladeburner/Actions/Casualties";

import { getRandomIntInclusive } from "../../../src/utils/helpers/getRandomIntInclusive";

describe("Bladeburner Team", () => {
  beforeEach(() => {
    // Return the high end of all random rolls
    getRandomIntInclusive.mockImplementationOnce((_: number, high: number) => high);
  });

  afterEach(() => jest.restoreAllMocks());

  it("always has a chance of zero deaths", () => {
    const r = CasualtyReport(10, OperationCasualtyOutcome.LOW_CASUALTIES, 0);
    expect(r.bestCase).toBe(0);
  });

  describe("Solo: with no members or sleeves", () => {
    it("remains unchanged on success", () => {
      const r = CasualtyReport(0, OperationCasualtyOutcome.LOW_CASUALTIES, 0);
      expect(r.worstCase).toBe(0);
      expect(r.deaths).toBe(0);
    });

    it("remains unchanged on failure", () => {
      const r = CasualtyReport(0, OperationCasualtyOutcome.LOW_CASUALTIES, 0);
      expect(r.worstCase).toBe(0);
      expect(r.deaths).toBe(0);
    });
  });

  describe("with members assigned to action", () => {
    it("shrinks when casualties killed (no sleeves)", () => {
      const deaths = 5;
      const report = { deaths, damagedSleeves: 0 };
      const team = TeamWithShockingSleeves(15, 0);
      KillBladeburnerCasualties(report, team);
      expect(team).toMatchObject({ teamSize: 10, teamLost: deaths });
    });
  });

  describe("with members and supporting sleeves assigned to action", () => {
    it("shrinks when casualties killed (with supporting sleeves)", () => {
      const deaths = 5;
      const report = { deaths, damagedSleeves: 3 };
      const team = TeamWithShockingSleeves(10, 8);
      KillBladeburnerCasualties(report, team);
      expect(team).toMatchObject({ teamSize: 10 - deaths + 3, teamLost: deaths, sleeveSize: 8 });
    });
  });

  describe("Casualties", () => {
    it("are potentially entire team when high", () => {
      const losses = CasualtyReport(5, OperationCasualtyOutcome.HIGH_CASUALTIES, 0);
      expect(losses.worstCase).toBe(5);
    });

    it("at worst half the team when low", () => {
      const losses = CasualtyReport(5, OperationCasualtyOutcome.LOW_CASUALTIES, 0);
      expect(losses.worstCase).toBeLessThan(5);
      expect(losses.worstCase).toBeGreaterThan(0);
    });

    it("include supporting sleeves by taking damage when losses exceed team size (and supporting sleeves > 0)", () => {
      const losses = CasualtyReport(12, OperationCasualtyOutcome.HIGH_CASUALTIES, 5);
      expect(losses.damagedSleeves).toBeGreaterThan(0);
      expect(losses.damagedSleeves).toBeLessThanOrEqual(5);
    });
  });

  function TeamWithShockingSleeves(teamSize: number = 0, sleeveSize: number = 0): OperationTeam {
    let sleevesShocked = 0;
    return {
      teamSize,
      teamLost: 0,
      sleeveSize,
      killSupportingSleeves(numShocked: number) {
        sleevesShocked += numShocked;
      },
    };
  }
});
