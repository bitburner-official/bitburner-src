import { ActionIdentifier } from "../Types";
import { BladeburnerActionType } from "@enums";
import { loadActionIdentifier } from "../utils/loadActionIdentifier";

/** Resolve identifier by auto completing from a fuzzy type match, e.g. "blackops" */
export function autoCompleteTypeShorthand(typeShorthand: string, name: string): ActionIdentifier | null {
  let id = loadActionIdentifier({ name });

  if (id && !TerminalShorthands[id.type].includes(typeShorthand.toLowerCase().trim())) {
    id = null;
  }

  return id;
}

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
