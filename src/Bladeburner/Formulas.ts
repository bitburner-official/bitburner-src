import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { FactionName } from "../Enums";
import { Factions } from "../Faction/Factions";
import type { Person } from "../PersonObjects/Person";
import { BladeburnerConstants } from "./data/Constants";
import { BladeburnerActionType, BladeburnerGeneralActionName } from "./Enums";
import type { Action } from "./Types";

export function calculateActionRankGain(action: Action, level?: number): number {
  switch (action.type) {
    case BladeburnerActionType.General:
      if (action.name === BladeburnerGeneralActionName.FieldAnalysis) {
        return 0.1 * currentNodeMults.BladeburnerRank;
      }
      break;
    case BladeburnerActionType.Contract:
    case BladeburnerActionType.Operation: {
      if (level == null) {
        level = action.level;
      }
      const rewardMultiplier = Math.pow(action.rewardFac, level - 1);
      return action.rankGain * rewardMultiplier * currentNodeMults.BladeburnerRank;
    }
    case BladeburnerActionType.BlackOp:
      return action.rankGain * currentNodeMults.BladeburnerRank;
  }
  return 0;
}

export function calculateActionReputationGain(person: Person, rankGain: number): number {
  const favorBonus = 1 + Factions[FactionName.Bladeburners].favor / 100;
  return BladeburnerConstants.RankToFactionRepFactor * rankGain * person.mults.faction_rep * favorBonus;
}
