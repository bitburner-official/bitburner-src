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
 * and killing sleeves (to shock them, sleeves are immortal)
 */
export function resolveTeamCasualties(action: TeamActionWithCasualties, team: OperationTeam, success: boolean): number {
  if (action.teamCount <= 0) {
    return 0;
  }

  // Operation actions and Black Operation actions have different min casualties: Min of Ops = 0. Min of BlackOps = 1.
  const minCasualties = action.getMinimumCasualties();
  const maxCasualties = success
    ? Math.ceil(action.teamCount * CasualtyFactor.LOW_CASUALTIES)
    : Math.floor(action.teamCount * CasualtyFactor.HIGH_CASUALTIES);
  /**
   * In the current state, it's safe to assume that minCasualties <= maxCasualties. However, in the future, if we change
   * min casualties, LOW_CASUALTIES, or HIGH_CASUALTIES, the call of getTeamCasualtiesRoll may crash.
   * getTeamCasualtiesRoll is just getRandomIntInclusive, and that function's parameters need to be in the form of
   * (min, max).
   */
  const losses =
    minCasualties <= maxCasualties ? team.getTeamCasualtiesRoll(minCasualties, maxCasualties) : minCasualties;
  // Calculate the new teamSize in a temporary variable and call the setter team.teamSize ONCE.
  // Note that it's important to call the setter only once; otherwise, the team count of each operation won't be reset
  // correctly.
  // For example, if _teamSize is 9 (1 team member + 8 support sleeves) and "losses" is 9, calling the setter with
  // (team.teamSize - losses) will set teamCount of ops/blackOps to 0 while it should be 8.
  let newTeamSize = team.teamSize - losses;
  if (newTeamSize < team.sleeveSize) {
    team.killRandomSupportingSleeves(team.sleeveSize - newTeamSize);
    // If this happens, all team members died and some sleeves took damage. In this case, teamSize = sleeveSize.
    newTeamSize = team.sleeveSize;
  }
  team.teamSize = newTeamSize;
  team.teamLost += losses;

  return losses;
}
