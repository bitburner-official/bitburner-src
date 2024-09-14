import type { ActionIdentifier } from "../Types";
import { assertLoadingType } from "../../utils/TypeAssertion";
import { BlackOperation, Contract, GeneralAction, Operation } from "../Actions";

/** Loads an action identifier
 * This is used for loading ActionIdentifier class objects from pre-2.6.1
 * Should load both the old format and the new format */
export function loadActionIdentifier(identifier: unknown): ActionIdentifier | null {
  if (!identifier || typeof identifier !== "object" || !("name" in identifier)) return null;
  assertLoadingType<ActionIdentifier>(identifier);
  return resolveActionIdentifierFromName(identifier.name);
}

export const resolveActionIdentifierFromName = (name: unknown): ActionIdentifier | null => {
  if (Contract.IsAcceptedName(name)) return Contract.createId(name);
  if (BlackOperation.IsAcceptedName(name)) return BlackOperation.createId(name);
  if (GeneralAction.IsAcceptedName(name)) return GeneralAction.createId(name);
  if (Operation.IsAcceptedName(name)) return Operation.createId(name);

  return null;
};
