import { CasualtyFactor, TeamCasualties } from "../../../src/Bladeburner/Actions/TeamCasualties";
import { getRandomIntInclusive } from "../../../src/utils/helpers/getRandomIntInclusive";

describe("Bladeburner Team", () => {
  const HIGH_ROLL = (_: number, high: number) => high;
  const NORMAL_ROLL = getRandomIntInclusive;

  const CasualtyReport = (used: number, severity: CasualtyFactor, sleeves: number = 0) =>
    new TeamCasualties(severity, used, sleeves);

  it("always has a chance of zero deaths", () => {
    expect(CasualtyReport(10, CasualtyFactor.LOW_CASUALTIES, 0).bestCase).toBe(0);
  });

  describe("Solo: with no members or sleeves", () => {
    it.each([[CasualtyFactor.LOW_CASUALTIES], [CasualtyFactor.HIGH_CASUALTIES]])(
      "remains unchanged at all rates: %s",
      () => {
        expect(CasualtyReport(0, CasualtyFactor.LOW_CASUALTIES, 0)).toMatchObject({ worstCase: 0, bestCase: 0 });
      },
    );
  });

  describe("Team members assigned to action (no sleeves)", () => {
    it("get killed according to roll", () => {
      const c = CasualtyReport(15, CasualtyFactor.LOW_CASUALTIES);
      const { team } = c.rollOutcome(HIGH_ROLL, TeamWithShockingSleeves(15));
      expect(team).toMatchObject({ teamSize: 7, teamLost: 8 });
    });

    it("may only get killed when assigned (team used <= team size)", () => {
      const teamUsed = 10;
      const teamSize = 20;
      const c = CasualtyReport(teamUsed, CasualtyFactor.HIGH_CASUALTIES);
      const { team } = c.rollOutcome(HIGH_ROLL, TeamWithShockingSleeves(teamSize));
      expect(team.teamLost).toBeLessThanOrEqual(teamUsed);
    });
  });

  describe("Team members and sleeves assigned to action", () => {
    it("get killed with human casualties first", () => {
      const c = CasualtyReport(18, CasualtyFactor.LOW_CASUALTIES, 8);
      const teamWithShockControl = TeamWithShockingSleeves(10);
      const { team, damagedSleeves } = c.rollOutcome(NORMAL_ROLL, teamWithShockControl);
      expect(damagedSleeves).toBe(0);
      expect(teamWithShockControl.shocked).toBe(0);
    });

    it("shocks sleeves when deaths exceed human team size", () => {
      const totalAssigned = 18;
      const c = CasualtyReport(totalAssigned, CasualtyFactor.HIGH_CASUALTIES, 8);
      const { team, damagedSleeves } = c.rollOutcome(HIGH_ROLL, TeamWithShockingSleeves(18));
      expect(damagedSleeves).toBe(8);
    });
  });

  describe("Casualties", () => {
    it("are potentially entire team when high", () => {
      const losses = CasualtyReport(5, CasualtyFactor.HIGH_CASUALTIES, 0);
      expect(losses.worstCase).toBe(5);
    });

    it("at worst half the team when low", () => {
      const losses = CasualtyReport(5, CasualtyFactor.LOW_CASUALTIES, 0);
      expect(losses.worstCase).toBeLessThan(5);
      expect(losses.worstCase).toBeGreaterThan(0);
    });
  });

  function TeamWithShockingSleeves(teamSize: number = 0) {
    let sleevesShocked = 0;
    return {
      teamSize,
      teamLost: 0,
      killSupportingSleeves(numShocked: number) {
        sleevesShocked += numShocked;
      },
      get shocked() {
        return sleevesShocked;
      },
    };
  }
});
