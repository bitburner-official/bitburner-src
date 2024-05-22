import type { Person } from "../../PersonObjects/Person";
import type { BlackOperation } from "./BlackOperation";
import type { Bladeburner } from "../Bladeburner";
import type { Availability, ActionIdentifier, SuccessChanceParams } from "../Types";

import { BladeActionType, BladeMultName, BladeOperationName } from "@enums";
import { BladeburnerConstants } from "../data/Constants";
import { ActionClass } from "./Action";
import { Generic_fromJSON, IReviverValue, constructorsForReviver } from "../../utils/JSONReviver";
import { LevelableActionClass, LevelableActionParams } from "./LevelableAction";
import { clampInteger } from "../../utils/helpers/clampNumber";

export interface OperationParams extends LevelableActionParams {
  name: BladeOperationName;
  getAvailability?: (bladeburner: Bladeburner) => Availability;
}

export class Operation extends LevelableActionClass {
  type: BladeActionType.operation = BladeActionType.operation;
  name = BladeOperationName.investigation;
  teamCount = 0;
  get id(): ActionIdentifier {
    return { type: this.type, name: this.name };
  }

  constructor(params: OperationParams | null = null) {
    super(params);
    if (!params) return;
    this.name = params.name;
    if (params.getAvailability) this.getAvailability = params.getAvailability;
  }

  // These functions are shared between operations and blackops, so they are defined outside of Operation
  getTeamSuccessBonus = operationTeamSuccessBonus;
  getActionTypeSkillSuccessBonus = operationSkillSuccessBonus;

  getChaosSuccessFactor(inst: Bladeburner /*, params: ISuccessChanceParams*/): number {
    const city = inst.getCurrentCity();
    if (city.chaos > BladeburnerConstants.ChaosThreshold) {
      const diff = 1 + (city.chaos - BladeburnerConstants.ChaosThreshold);
      const mult = Math.pow(diff, 0.5);
      return mult;
    }

    return 1;
  }
  getSuccessChance(inst: Bladeburner, person: Person, params: SuccessChanceParams) {
    if (this.name == BladeOperationName.raid && inst.getCurrentCity().comms <= 0) return 0;
    return ActionClass.prototype.getSuccessChance.call(this, inst, person, params);
  }

  reset() {
    LevelableActionClass.prototype.reset.call(this);
    this.teamCount = 0;
  }

  toJSON(): IReviverValue {
    return this.save("Operation", "teamCount");
  }
  loadData(loadedObject: Operation): void {
    this.teamCount = clampInteger(loadedObject.teamCount, 0);
    LevelableActionClass.prototype.loadData.call(this, loadedObject);
  }

  static fromJSON(value: IReviverValue): Operation {
    return Generic_fromJSON(Operation, value.data);
  }
}

constructorsForReviver.Operation = Operation;

// shared member functions for Operation and BlackOperation
export const operationSkillSuccessBonus = (inst: Bladeburner) => {
  return inst.getSkillMult(BladeMultName.successChanceOperation);
};
export function operationTeamSuccessBonus(this: Operation | BlackOperation, inst: Bladeburner) {
  if (this.teamCount && this.teamCount > 0) {
    this.teamCount = Math.min(this.teamCount, inst.teamSize);
    const teamMultiplier = Math.pow(this.teamCount, 0.05);
    return teamMultiplier;
  }

  return 1;
}
