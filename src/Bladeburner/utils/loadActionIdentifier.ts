import type { ActionIdentifier } from "../Types";
import { BladeActionType } from "@enums";
import { assertLoadingType } from "../../utils/TypeAssertion";
import { getEnumHelper } from "../../utils/EnumHelper";

/** Loads an action identifier
 * This is used for loading ActionIdentifier class objects from pre-2.6.1
 * Should load both the old format and the new format */
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
