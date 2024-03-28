import type { Bladeburner } from "../Bladeburner";
import type { Availability, ActionIdentifier } from "../Types";

import { BladeActionType, BladeBlackOpName } from "@enums";
import { ActionClass, ActionParams } from "./Action";
import { operationSkillSuccessBonus, operationTeamSuccessBonus } from "./Operation";

interface BlackOpParams {
  name: BladeBlackOpName;
  reqdRank: number;
  n: number;
}

export class BlackOperation extends ActionClass {
  type: BladeActionType.blackOp = BladeActionType.blackOp;
  name: BladeBlackOpName;
  n: number;
  reqdRank: number;
  teamCount = 0;
  get id(): ActionIdentifier {
    return { type: this.type, name: this.name };
  }

  constructor(params: ActionParams & BlackOpParams) {
    super(params);
    this.name = params.name;
    this.reqdRank = params.reqdRank;
    this.n = params.n;
  }

  getAvailability(bladeburner: Bladeburner): Availability {
    if (bladeburner.numBlackOpsComplete < this.n) return { error: "Have not completed the previous Black Operation" };
    if (bladeburner.numBlackOpsComplete > this.n) return { error: "Already completed" };
    if (bladeburner.rank < this.reqdRank) return { error: "Insufficient rank" };
    return { available: true };
  }
  // To be implemented by subtypes
  getActionTimePenalty(): number {
    return 1.5;
  }

  getPopulationSuccessFactor(/*inst: Bladeburner, params: ISuccessChanceParams*/): number {
    return 1;
  }

  getChaosSuccessFactor(/*inst: Bladeburner, params: ISuccessChanceParams*/): number {
    return 1;
  }
  getTeamSuccessBonus = operationTeamSuccessBonus;
  getActionTypeSkillSuccessBonus = operationSkillSuccessBonus;
}
