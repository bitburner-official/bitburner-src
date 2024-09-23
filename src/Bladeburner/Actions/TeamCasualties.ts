export enum CasualtyFactor {
  LOW_CASUALTIES = 0.5, // 50%
  HIGH_CASUALTIES = 1, // 100%
}

export interface OperationTeam {
  /** teamSize = Human Team + Supporting Sleeves */
  teamSize: number;
  teamLost: number;
  /** number of supporting sleeves at time of action completion */
  sleeveSize: number;

  getTeamCasualtiesRoll(low: number, high: number): number;

  killRandomSupportingSleeves(sleeveDeaths: number): void;
}

export interface TeamActionWithCasualties {
  teamCount: number;

  getMinimumCasualties(): number;
}

/**
 * Some actions (Operations and Black Operations) use teams for success bonus
 * and may result in casualties, reducing the player's hp, killing team members
 * and killing sleeves (to shock them, sleeves are immortal) *
 */
export function resolveTeamCasualties(action: TeamActionWithCasualties, team: OperationTeam, success: boolean) {
  const severity = success ? CasualtyFactor.LOW_CASUALTIES : CasualtyFactor.HIGH_CASUALTIES;
  const radius = action.teamCount * severity;
  const worstCase = severity < 1 ? Math.ceil(radius) : Math.floor(radius);
  /** Best case is always no deaths */
  const deaths = team.getTeamCasualtiesRoll(action.getMinimumCasualties(), worstCase);
  const humans = action.teamCount - team.sleeveSize;
  const humanDeaths = Math.min(humans, deaths);
  /** Supporting Sleeves take damage when they are part of losses,
   *   e.g. 8 sleeves + 3 team members with 4 losses -> 1 sleeve takes damage */
  team.killRandomSupportingSleeves(deaths - humanDeaths);

  /** Clamped, bugfix for PR#1659
   * "BUGFIX: Wrong team size when all team members die in Bladeburner's action" */
  team.teamSize = Math.max(team.teamSize - humanDeaths, team.sleeveSize);
  team.teamLost += deaths;

  return deaths;
}
