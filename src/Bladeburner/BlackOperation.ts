import { BladeBlackOpName } from "@enums";
import { Action, ActionParams } from "./Action";
import { operationSkillSuccessBonus, operationTeamSuccessBonus } from "./Operation";

interface BlackOpParams {
  name: BladeBlackOpName;
  reqdRank: number;
  desc: string;
  id: number;
}

export class BlackOperation extends Action {
  name: BladeBlackOpName;
  id: number;
  // TODO temporary - desc will be moved to action constructor after further changes in this PR
  desc: string;
  reqdRank: number;
  teamCount = 0;
  constructor(params: ActionParams & BlackOpParams) {
    super(params);
    this.name = params.name;
    this.count = 1;
    this.reqdRank = params.reqdRank;
    this.id = params.id;
    // TODO temporary - this will be moved to action constructor after further changes in this PR
    this.desc = params.desc;
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
