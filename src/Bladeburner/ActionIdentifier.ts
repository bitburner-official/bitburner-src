import {
  BladeActionType,
  BladeBlackOpName,
  BladeContractName,
  BladeGeneralActionName,
  BladeOperationName,
} from "@enums";
import { getEnumHelper } from "../utils/EnumHelper";
import { assertLoadingType } from "../utils/JSONReviver";

export type ActionIdentifier =
  | { type: BladeActionType.blackOp; name: BladeBlackOpName }
  | { type: BladeActionType.contract; name: BladeContractName }
  | { type: BladeActionType.operation; name: BladeOperationName }
  | { type: BladeActionType.general; name: BladeGeneralActionName };

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
