import { BladeOperationName } from "@enums";
import type { BlackOperation } from "./BlackOperation";
import { Bladeburner } from "./Bladeburner";
import { BladeburnerConstants } from "./data/Constants";
import { Action, ActionParams } from "./Action";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";

export interface OperationParams extends ActionParams {
  name: BladeOperationName;
  reqdRank?: number;
  teamCount?: number;
}

export class Operation extends Action {
  name = BladeOperationName.investigation;
  reqdRank = 100;
  teamCount = 0;

  constructor(params: OperationParams | null = null) {
    super(params);
    if (!params) return;
    this.name = params.name;
    if (params.reqdRank) this.reqdRank = params.reqdRank;
    if (params.teamCount) this.teamCount = params.teamCount;
  }

  // These functions are shared between operations and blackops, so they are defined outside of Operation
  getTeamSuccessBonus = operationTeamSuccessBonus;
  getActionTypeSkillSuccessBonus = operationSkillSuccessBonus;

  getChaosDifficultyBonus(inst: Bladeburner /*, params: ISuccessChanceParams*/): number {
    const city = inst.getCurrentCity();
    if (city.chaos > BladeburnerConstants.ChaosThreshold) {
      const diff = 1 + (city.chaos - BladeburnerConstants.ChaosThreshold);
      const mult = Math.pow(diff, 0.5);
      return mult;
    }

    return 1;
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("Operation", this);
  }

  static fromJSON(value: IReviverValue): Operation {
    return Generic_fromJSON(Operation, value.data);
  }
}

constructorsForReviver.Operation = Operation;

// shared member functions for Operation and BlackOperation
export const operationSkillSuccessBonus = (inst: Bladeburner) => inst.skillMultipliers.successChanceOperation;
export function operationTeamSuccessBonus(this: Operation | BlackOperation, inst: Bladeburner) {
  if (this.teamCount && this.teamCount > 0) {
    this.teamCount = Math.min(this.teamCount, inst.teamSize);
    const teamMultiplier = Math.pow(this.teamCount, 0.05);
    return teamMultiplier;
  }

  return 1;
}
