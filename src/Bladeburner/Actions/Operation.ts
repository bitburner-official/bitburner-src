import type { Person } from "../../PersonObjects/Person";
import type { BlackOperation } from "./BlackOperation";
import type { Bladeburner } from "../Bladeburner";
import type { ActionIdFor, Availability, SuccessChanceParams } from "../Types";

import { BladeburnerActionType, BladeburnerMultName, BladeburnerOperationName } from "@enums";
import { BladeburnerConstants } from "../data/Constants";
import { ActionClass } from "./Action";
import { constructorsForReviver, Generic_fromJSON, IReviverValue } from "../../utils/JSONReviver";
import { LevelableActionClass, LevelableActionParams } from "./LevelableAction";
import { clampInteger } from "../../utils/helpers/clampNumber";
import { getEnumHelper } from "../../utils/EnumHelper";
import type { TeamActionWithCasualties } from "./TeamCasualties";

export interface OperationParams extends LevelableActionParams {
  name: BladeburnerOperationName;
  getAvailability?: (bladeburner: Bladeburner) => Availability;
}

export class Operation extends LevelableActionClass implements TeamActionWithCasualties {
  readonly type: BladeburnerActionType.Operation = BladeburnerActionType.Operation;
  readonly name: BladeburnerOperationName;
  teamCount = 0;

  get id() {
    return Operation.createId(this.name);
  }

  static IsAcceptedName(name: unknown): name is BladeburnerOperationName {
    return getEnumHelper("BladeburnerOperationName").isMember(name);
  }

  static createId(name: BladeburnerOperationName): ActionIdFor<Operation> {
    return { type: BladeburnerActionType.Operation, name };
  }

  constructor(params: OperationParams | null = null) {
    super(params);
    this.name = params?.name ?? BladeburnerOperationName.Investigation;
    if (params && params.getAvailability) this.getAvailability = params.getAvailability;
  }

  // These functions are shared between operations and blackops, so they are defined outside of Operation
  getTeamSuccessBonus = operationTeamSuccessBonus;

  getActionTypeSkillSuccessBonus = operationSkillSuccessBonus;

  getMinimumCasualties(): number {
    return 0;
  }

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
    if (this.name === BladeburnerOperationName.Raid && inst.getCurrentCity().comms <= 0) {
      return 0;
    }
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
  return inst.getSkillMult(BladeburnerMultName.SuccessChanceOperation);
};

export function operationTeamSuccessBonus(this: Operation | BlackOperation, inst: Bladeburner) {
  if (this.teamCount && this.teamCount > 0) {
    this.teamCount = Math.min(this.teamCount, inst.teamSize);
    const teamMultiplier = Math.pow(this.teamCount, 0.05);
    return teamMultiplier;
  }

  return 1;
}
