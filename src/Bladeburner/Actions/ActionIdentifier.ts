import type { ActionIdentifier } from "../Types";

import { BladeActionType } from "@enums";
import { getEnumHelper } from "../../utils/EnumHelper";
import { assertLoadingType } from "../../utils/JSONReviver";

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

// todo 3.0, remove this fuzz and expect a valid exact action from players
export function getActionIdFromTypeAndName(type = "", name = ""): ActionIdentifier | null {
  if (!type || !name) return null;
  const convertedType = type.toLowerCase().trim();
  switch (convertedType) {
    case "contract":
    case "contracts":
    case "contr":
      if (!getEnumHelper("BladeContractName").isMember(name)) return null;
      return { type: BladeActionType.contract, name };
    case "operation":
    case "operations":
    case "op":
    case "ops":
      if (!getEnumHelper("BladeOperationName").isMember(name)) return null;
      return { type: BladeActionType.operation, name };
    case "blackoperation":
    case "black operation":
    case "black operations":
    case "black op":
    case "black ops":
    case "blackop":
    case "blackops":
      if (!getEnumHelper("BladeBlackOpName").isMember(name)) return null;
      return { type: BladeActionType.blackOp, name };
    case "general":
    case "general action":
    case "gen": {
      const actionName = getEnumHelper("BladeGeneralActionName").getMember(name, { fuzzy: true });
      if (!actionName) return null;
      return { type: BladeActionType.general, name: actionName };
    }
    default:
      return null;
  }
}
