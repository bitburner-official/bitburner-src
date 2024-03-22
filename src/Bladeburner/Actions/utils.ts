import type { Action, ActionIdentifier } from "../Types";
import type { BlackOperation } from "./BlackOperation";
import type { Operation } from "./Operation";
import type { Contract } from "./Contract";
import type { GeneralAction } from "./GeneralAction";

import { BladeActionType } from "@enums";
import { getEnumHelper } from "../../utils/EnumHelper";
import { Contracts } from "../data/Contracts";
import { Operations } from "../data/Operations";
import { BlackOperations } from "../data/BlackOperations";
import { GeneralActions } from "../data/GeneralActions";

/** Return the action based on an ActionIdentifier, discriminating types when possible */
export function getActionObject(actionId: ActionIdentifier & { type: BladeActionType.blackOp }): BlackOperation;
export function getActionObject(actionId: ActionIdentifier & { type: BladeActionType.operation }): Operation;
export function getActionObject(actionId: ActionIdentifier & { type: BladeActionType.contract }): Contract;
export function getActionObject(actionId: ActionIdentifier & { type: BladeActionType.general }): GeneralAction;
export function getActionObject(actionId: ActionIdentifier): Action;
export function getActionObject(actionId: ActionIdentifier): Action {
  switch (actionId.type) {
    case BladeActionType.contract:
      return Contracts[actionId.name];
    case BladeActionType.operation:
      return Operations[actionId.name];
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
      return Contracts[name];
    case "operation":
    case "operations":
    case "op":
    case "ops":
      if (!getEnumHelper("BladeOperationName").isMember(name)) return null;
      return Operations[name];
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
