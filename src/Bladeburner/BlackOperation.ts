import { Operation, IOperationParams } from "./Operation";
import { BladeBlackOpName } from "./Enums";

export class BlackOperation extends Operation {
  name: BladeBlackOpName;
  constructor(params: IOperationParams & { name: BladeBlackOpName }) {
    super(params);
    this.name = params.name;
    this.count = 1;
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
