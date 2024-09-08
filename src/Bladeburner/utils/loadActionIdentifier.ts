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

/** These shorthands match those documented in the BB Terminal Help */
const BladeBurnerTerminalShorthands = {
  contracts: <readonly string[]>["contract", "contracts", "contr"],
  operations: <readonly string[]>["operation", "operations", "op", "ops"],
  blackops: <readonly string[]>[
    "blackoperation",
    "black operation",
    "black operations",
    "black op",
    "black ops",
    "blackop",
    "blackops",
  ],
  general: <readonly string[]>["general", "general action", "gen"],
} as const;

export function fuzzyActionIdentifier(typeShorthand: string, name: string): ActionIdentifier | null {
  const type = typeShorthand.toLowerCase().trim();
  if (
    BladeBurnerTerminalShorthands.contracts.includes(type) &&
    getEnumHelper("BladeburnerContractName").isMember(name)
  ) {
    return { type: BladeburnerActionType.Contract, name };
  }

  if (
    BladeBurnerTerminalShorthands.operations.includes(type) &&
    getEnumHelper("BladeburnerOperationName").isMember(name)
  ) {
    return { type: BladeburnerActionType.Operation, name };
  }

  if (BladeBurnerTerminalShorthands.blackops.includes(type) && getEnumHelper("BladeburnerBlackOpName").isMember(name)) {
    return { type: BladeburnerActionType.BlackOp, name };
  }

  if (
    BladeBurnerTerminalShorthands.general.includes(type) &&
    getEnumHelper("BladeburnerGeneralActionName").isMember(name)
  ) {
    return { type: BladeburnerActionType.General, name };
  }

  return null;
}
