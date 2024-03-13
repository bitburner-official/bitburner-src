import type { BladeBlackOpName } from "@enums";
import { Operation, IOperationParams } from "./Operation";

export class BlackOperation extends Operation {
  name: BladeBlackOpName;
  id: number;
  // TODO temporary - desc will be moved higher up in the class hierarchy after further changes in this PR
  desc: string;
  constructor(params: IOperationParams & { name: BladeBlackOpName; desc: string; id: number }) {
    super(params);
    this.name = params.name;
    this.count = 1;
    /** This blackOp's index in the ordered array */
    this.id = params.id;
    // TODO temporary - this will be moved higher up in the class hierarchy after further changes in this PR
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
}
