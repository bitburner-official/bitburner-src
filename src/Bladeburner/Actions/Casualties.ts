import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { OperationTeam } from "../Bladeburner";

export type Casualties = {
  deaths: number; // Actual roll
  damagedSleeves: number; // Sleeves included in actual deaths
};

type CasualtyRolls = {
  worstCase: number; // High end roll for potential deaths
  bestCase: number; // Low end roll for potential deaths
};

export enum OperationCasualtyOutcome {
  LOW_CASUALTIES,
  HIGH_CASUALTIES,
}

/**
 * Some actions (Operations and Black Operations) can result in casualties,
 * reducing the person's hp, killing team members and damage sleeves (for max hp)
 *
 * Caveats: TeamSize = Team + Supporting Sleeves set to this action
 */
export function CasualtyReport(
  teamSizeUsedForAction: number,
  outcome: OperationCasualtyOutcome,
  sleeves: number,
): Casualties & CasualtyRolls {
  const bestCase = 0; // No deaths
  const worstCaseFraction = outcome === OperationCasualtyOutcome.LOW_CASUALTIES ? 0.5 : 1;
  const worstCaseOp = Math[outcome === OperationCasualtyOutcome.LOW_CASUALTIES ? "ceil" : "floor"];
  const worstCase = worstCaseOp(teamSizeUsedForAction * worstCaseFraction);
  const deaths = getRandomIntInclusive(bestCase, worstCase);
  const damagedSleeves = teamSizeUsedForAction - deaths < sleeves ? sleeves - (teamSizeUsedForAction - deaths) : 0;

  return { worstCase, bestCase, deaths, damagedSleeves };
}

export function KillBladeburnerCasualties({ deaths, damagedSleeves }: Casualties, team: OperationTeam) {
  if (deaths === 0) return;

  team.teamSize -= deaths - damagedSleeves;
  team.teamLost += deaths;

  /** Supporting Sleeves take damage when they are part of losses,
   *   e.g. 8 sleeves + 3 team members with 4 losses -> 1 sleeve takes damage */
  if (damagedSleeves > 0) {
    team.killSupportingSleeves(damagedSleeves);
  }
}
