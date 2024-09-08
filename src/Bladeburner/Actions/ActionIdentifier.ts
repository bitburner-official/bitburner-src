import type { ActionIdentifier } from "../Types";
import { BladeburnerActionType } from "@enums";
import { assertLoadingType } from "../../utils/TypeAssertion";
import { getEnumHelper } from "../../utils/EnumHelper";

/** Loads an action identifier
 * This is used for loading ActionIdentifier class objects from pre-2.6.1
 * Should load both the old format and the new format */
export function resolveActionIdentifier(identifier: unknown): ActionIdentifier | null {
  if (!identifier || typeof identifier !== "object") return null;
  assertLoadingType<ActionIdentifier>(identifier);
  for (const matcher of TypeToActionMatchers) {
    const id = matcher(identifier.name);
    if (id) {
      return id;
    }
  }

  return null;
}

/** These shorthands match those documented in the BB Terminal Help */
export const TerminalShorthands = {
  [BladeburnerActionType.Contract]: <readonly string[]>["contract", "contracts", "contr"],
  [BladeburnerActionType.Operation]: <readonly string[]>["operation", "operations", "op", "ops"],
  [BladeburnerActionType.BlackOp]: <readonly string[]>[
    "blackoperation",
    "black operation",
    "black operations",
    "black op",
    "black ops",
    "blackop",
    "blackops",
  ],
  [BladeburnerActionType.General]: <readonly string[]>["general", "general action", "gen"],
} as const;

export function autoCompleteTypeShorthand(typeShorthand: string, name: string): ActionIdentifier | null {
  const matchedType = typeShorthand.toLowerCase().trim();
  let id = resolveActionIdentifier({ name });

  if (id && !TerminalShorthands[id.type].includes(matchedType)) {
    id = null;
  }

  return id;
}

const TypeToActionMatchers = [
  (name: unknown) =>
    getEnumHelper("BladeburnerContractName").isMember(name)
      ? ({ type: BladeburnerActionType.Contract, name } as const)
      : undefined,
  (name: unknown) =>
    getEnumHelper("BladeburnerOperationName").isMember(name)
      ? ({ type: BladeburnerActionType.Operation, name } as const)
      : undefined,
  (name: unknown) =>
    getEnumHelper("BladeburnerBlackOpName").isMember(name)
      ? ({ type: BladeburnerActionType.BlackOp, name } as const)
      : undefined,
  (name: unknown) =>
    getEnumHelper("BladeburnerGeneralActionName").isMember(name)
      ? ({ type: BladeburnerActionType.General, name } as const)
      : undefined,
] as const;
