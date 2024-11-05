import type { Bladeburner } from "../Bladeburner";
import type { ActionIdFor, Availability } from "../Types";

import { BladeburnerActionType, BladeburnerBlackOpName } from "@enums";
import { ActionClass, ActionParams } from "./Action";
import { operationSkillSuccessBonus, operationTeamSuccessBonus } from "./Operation";
import { getEnumHelper } from "../../utils/EnumHelper";
import type { TeamActionWithCasualties } from "./TeamCasualties";

interface BlackOpParams {
  name: BladeburnerBlackOpName;
  reqdRank: number;
  n: number;
}

export class BlackOperation extends ActionClass implements TeamActionWithCasualties {
  readonly type: BladeburnerActionType.BlackOp = BladeburnerActionType.BlackOp;
  readonly name: BladeburnerBlackOpName;
  n: number;
  reqdRank: number;
  teamCount = 0;

  get id() {
    return BlackOperation.createId(this.name);
  }

  static createId(name: BladeburnerBlackOpName): ActionIdFor<BlackOperation> {
    return { type: BladeburnerActionType.BlackOp, name };
  }

  static IsAcceptedName(name: unknown): name is BladeburnerBlackOpName {
    return getEnumHelper("BladeburnerBlackOpName").isMember(name);
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

  getActionTimePenalty(): number {
    return 1.5;
  }

  getPopulationSuccessFactor(): number {
    return 1;
  }

  getChaosSuccessFactor(): number {
    return 1;
  }

  getMinimumCasualties(): number {
    return 1;
  }

  getTeamSuccessBonus = operationTeamSuccessBonus;

  getActionTypeSkillSuccessBonus = operationSkillSuccessBonus;
}
