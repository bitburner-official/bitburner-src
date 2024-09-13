import { ActionIdentifier } from "../Types";
import { BladeburnerActionType } from "@enums";
import { assertLoadingType } from "../../utils/TypeAssertion";
import { Contract } from "./Contract";
import { BlackOperation } from "./BlackOperation";
import { GeneralAction } from "./GeneralAction";
import { Operation } from "./Operation";

/** Loads an action identifier
 * This is used for loading ActionIdentifier class objects from pre-2.6.1
 * Should load both the old format and the new format */
export function resolveActionIdentifier(identifier: unknown): ActionIdentifier | null {
  if (!identifier || typeof identifier !== "object" || !("name" in identifier)) return null;
  assertLoadingType<ActionIdentifier>(identifier);
  return resolveActionIdentifierFromName(identifier.name);
}

/** Resolve identifier by auto completing from a fuzzy type match, e.g. "blackops" */
export function autoCompleteTypeShorthand(typeShorthand: string, name: string): ActionIdentifier | null {
  let id = resolveActionIdentifier({ name });

  if (id && !TerminalShorthands[id.type].includes(typeShorthand.toLowerCase().trim())) {
    id = null;
  }

  return id;
}

const resolveActionIdentifierFromName = (name: unknown): ActionIdentifier | null => {
  if (Contract.IsAcceptedName(name)) return Contract.ActionIdentifier(name);
  if (BlackOperation.IsAcceptedName(name)) return BlackOperation.ActionIdentifier(name);
  if (GeneralAction.IsAcceptedName(name)) return GeneralAction.ActionIdentifier(name);
  if (Operation.IsAcceptedName(name)) return Operation.ActionIdentifier(name);

  return null;
};

/** These shorthands match those documented in the BB Terminal Help */
export const TerminalShorthands = {
  [BladeburnerActionType.Contract]: <string[]>["contract", "contracts", "contr"],
  [BladeburnerActionType.Operation]: <string[]>["operation", "operations", "op", "ops"],
  [BladeburnerActionType.BlackOp]: <string[]>[
    "blackoperation",
    "black operation",
    "black operations",
    "black op",
    "black ops",
    "blackop",
    "blackops",
  ],
  [BladeburnerActionType.General]: <string[]>["general", "general action", "gen"],
} as const;
