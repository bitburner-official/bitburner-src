import type { ActionIdentifier } from "../Types";
import { BladeburnerActionType } from "@enums";
import { assertLoadingType } from "../../utils/TypeAssertion";
import { getEnumHelper } from "../../utils/EnumHelper";

/** Loads an action identifier
 * This is used for loading ActionIdentifier class objects from pre-2.6.1
 * Should load both the old format and the new format */
export function loadActionIdentifier(identifier: unknown): ActionIdentifier | null {
  if (!identifier || typeof identifier !== "object") return null;
  assertLoadingType<ActionIdentifier>(identifier);
  if (getEnumHelper("BladeburnerBlackOpName").isMember(identifier.name)) {
    return { type: BladeburnerActionType.BlackOp, name: identifier.name };
  }
  if (getEnumHelper("BladeburnerContractName").isMember(identifier.name)) {
    return { type: BladeburnerActionType.Contract, name: identifier.name };
  }
  if (getEnumHelper("BladeburnerOperationName").isMember(identifier.name)) {
    return { type: BladeburnerActionType.Operation, name: identifier.name };
  }
  if (getEnumHelper("BladeburnerGeneralActionName").isMember(identifier.name)) {
    return { type: BladeburnerActionType.General, name: identifier.name };
  }
  return null;
}
