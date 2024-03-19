import type { Person } from "../../PersonObjects/Person";
import type { BlackOperation } from "./BlackOperation";
import type { Bladeburner } from "../Bladeburner";
import type { ActionAvailability, ActionIdentifier, SuccessChanceParams } from "../Types";

import { BladeActionType, BladeOperationName } from "@enums";
import { BladeburnerConstants } from "../data/Constants";
import { ActionClass } from "./Action";
import { IReviverValue, constructorsForReviver } from "../../utils/JSONReviver";
import { assertLoadingType } from "../../utils/TypeAssertion";
import { LevelableActionClass, LevelableActionParams, LevelableActionSaveData } from "./LevelableAction";
import { getEnumHelper } from "../../utils/EnumHelper";
import { Operations, initOperations } from "../data/Operations";

export interface OperationParams extends LevelableActionParams {
  name: BladeOperationName;
  getAvailability?: (bladeburner: Bladeburner) => ActionAvailability;
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
    return this.save("Operation", "teamCount", "name");
  }

  static fromJSON(value: IReviverValue): Operation {
    const operations = Operations || initOperations();
    // Don't load invalid operations
    const name = getEnumHelper("BladeOperationName").getMember(value.data?.name);
    if (!name) return undefined as unknown as Operation;
    if (!value.data || typeof value.data !== "object") return operations[name];
    assertLoadingType<OperationSaveData>(value.data);
    // Use generic LevelableAction loader first
    const loadedOperation = LevelableActionClass.load(operations[name], value.data);
    // Then load on extra operation-only fields
    if (typeof value.data.teamCount === "number") loadedOperation.teamCount = value.data.teamCount;
    return loadedOperation;
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

type OperationSaveData = LevelableActionSaveData & { teamCount: number };
