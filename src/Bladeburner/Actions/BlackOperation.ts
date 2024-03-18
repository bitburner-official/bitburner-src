import { BladeActionType, BladeBlackOpName } from "@enums";
import { ActionClass, ActionParams } from "./Action";
import { operationSkillSuccessBonus, operationTeamSuccessBonus } from "./Operation";

interface BlackOpParams {
  name: BladeBlackOpName;
  reqdRank: number;
  id: number;
}

export class BlackOperation extends ActionClass {
  type: BladeActionType.blackOp = BladeActionType.blackOp;
  name: BladeBlackOpName;
  id: number;
  reqdRank: number;
  teamCount = 0;
  constructor(params: ActionParams & BlackOpParams) {
    super(params);
    this.name = params.name;
    this.reqdRank = params.reqdRank;
    this.id = params.id;
  }

  // To be implemented by subtypes
  getActionTimePenalty(): number {
    return 1.5;
  }

  getChaosCompetencePenalty(/*inst: Bladeburner, params: ISuccessChanceParams*/): number {
    return 1;
  }

  getChaosDifficultyBonus(/*inst: Bladeburner, params: ISuccessChanceParams*/): number {
    return 1;
  }
  getTeamSuccessBonus = operationTeamSuccessBonus;
  getActionTypeSkillSuccessBonus = operationSkillSuccessBonus;
}
