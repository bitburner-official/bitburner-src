import type { Action, ActionIdentifier } from "../Types";
import type { BlackOperation } from "./BlackOperation";
import type { Operation } from "./Operation";
import type { Contract } from "./Contract";
import type { GeneralAction } from "./GeneralAction";

import { BladeActionType } from "@enums";
import { getEnumHelper } from "../../utils/EnumHelper";
import { assertLoadingType } from "../../utils/JSONReviver";
import { Contracts, initContracts } from "../data/Contracts";
import { Operations, initOperations } from "../data/Operations";
import { BlackOperations } from "../data/BlackOperations";
import { GeneralActions } from "../data/GeneralActions";

/** Returns null if the identifier is not valid */
export function loadActionIdentifier(identifier: unknown): ActionIdentifier | null {
  if (!identifier || typeof identifier !== "object") return null;
  assertLoadingType<ActionIdentifier>(identifier);
  if (getEnumHelper("BladeBlackOpName").isMember(identifier.name)) {
    return { type: BladeActionType.blackOp, name: identifier.name };
  }
  if (getEnumHelper("BladeContractName").isMember(identifier.name)) {
    return { type: BladeActionType.contract, name: identifier.name };
  }
  if (getEnumHelper("BladeOperationName").isMember(identifier.name)) {
    return { type: BladeActionType.operation, name: identifier.name };
  }
  if (getEnumHelper("BladeGeneralActionName").isMember(identifier.name)) {
    return { type: BladeActionType.general, name: identifier.name };
  }
  return null;
}

/** Return the action based on an ActionIdentifier, discriminating types when possible */
export function getActionObject(actionId: ActionIdentifier & { type: BladeActionType.blackOp }): BlackOperation;
export function getActionObject(actionId: ActionIdentifier & { type: BladeActionType.operation }): Operation;
export function getActionObject(actionId: ActionIdentifier & { type: BladeActionType.contract }): Contract;
export function getActionObject(actionId: ActionIdentifier & { type: BladeActionType.general }): GeneralAction;
export function getActionObject(actionId: ActionIdentifier): Action;
export function getActionObject(actionId: ActionIdentifier): Action {
  switch (actionId.type) {
    case BladeActionType.contract:
      return (Contracts ?? initContracts())[actionId.name];
    case BladeActionType.operation:
      return (Operations ?? initOperations())[actionId.name];
    case BladeActionType.blackOp:
      return BlackOperations[actionId.name];
    case BladeActionType.general:
      return GeneralActions[actionId.name];
  }
}

export function getActionFromTypeAndName(type: string, name: string): Action | null {
  if (!type || !name) return null;
  const convertedType = type.toLowerCase().trim();
  switch (convertedType) {
    case "contract":
    case "contracts":
    case "contr":
      if (!getEnumHelper("BladeContractName").isMember(name)) return null;
      return (Contracts ?? initContracts())[name];
    case "operation":
    case "operations":
    case "op":
    case "ops":
      if (!getEnumHelper("BladeOperationName").isMember(name)) return null;
      return (Operations ?? initOperations())[name];
    case "blackoperation":
    case "black operation":
    case "black operations":
    case "black op":
    case "black ops":
    case "blackop":
    case "blackops":
      if (!getEnumHelper("BladeBlackOpName").isMember(name)) return null;
      return BlackOperations[name];
    case "general":
    case "general action":
    case "gen": {
      if (!getEnumHelper("BladeGeneralActionName").isMember(name)) return null;
      return GeneralActions[name];
    }
  }
  return null;
}
