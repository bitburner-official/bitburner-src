import type { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";

export enum CasualtyFactor {
  LOW_CASUALTIES = 0.5, // 50%
  HIGH_CASUALTIES = 1, // 100%
}

export interface OperationTeam {
  teamSize: number;
  teamLost: number;

  killSupportingSleeves(sleeveDeaths: number): void;
}

/**
 * Some actions (Operations and Black Operations) use teams for success bonus
 * and may result in casualties, reducing the player's hp, killing team members
 * and killing sleeves (to shock them, sleeves are immortal)
 *
 * Caveats: TeamSize = Human Team + Supporting Sleeves set to this action
 */
export class TeamCasualties {
  constructor(private severity: CasualtyFactor, private teamSizeUsed: number, private supportingSleeves: number) {}

  rollOutcome(random: typeof getRandomIntInclusive, team: OperationTeam) {
    const deaths = random(this.bestCase, this.worstCase);
    const humans = this.teamSizeUsed - this.supportingSleeves;
    const humanDeaths = Math.min(humans, deaths);
    const damagedSleeves = deaths - humanDeaths;

    /** Supporting Sleeves take damage when they are part of losses,
     *   e.g. 8 sleeves + 3 team members with 4 losses -> 1 sleeve takes damage */
    team.killSupportingSleeves(damagedSleeves);

    team.teamSize -= humanDeaths;
    team.teamLost += deaths;

    return { deaths, team, damagedSleeves };
  }

  get worstCase() {
    const worstCaseOp = Math[this.severity < 1 ? "ceil" : "floor"];
    return worstCaseOp(this.teamSizeUsed * this.severity);
  }

  get bestCase() {
    return 0;
  }
}
