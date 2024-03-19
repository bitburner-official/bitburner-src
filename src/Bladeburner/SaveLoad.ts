import type { ActionIdentifier } from "./Types";
import { BladeActionType } from "@enums";
import { assertLoadingType } from "../utils/TypeAssertion";
import { getEnumHelper } from "../utils/EnumHelper";

// Helpers related to save and load functionality

/** Returns null if the identifier is not valid
 * Loads solely based on the "name" attribute, so it loads pre-2.6.1 ActionIdentifiers correctly */
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
