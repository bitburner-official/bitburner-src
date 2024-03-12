import { Operation, IOperationParams } from "./Operation";
import { BladeBlackOpName } from "./Enums";

export class BlackOperation extends Operation {
  name: BladeBlackOpName;
  // TODO temporary - desc will be moved higher up in the class hierarchy after further changes in this PR
  desc: string;
  constructor(params: IOperationParams & { name: BladeBlackOpName; desc: string }) {
    super(params);
    this.name = params.name;
    this.count = 1;
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
