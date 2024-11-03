import type { BlackOperation, Contract, GeneralAction, Operation } from "./Actions";

export interface SuccessChanceParams {
  /** Whether the success chance should be based on estimated statistics */
  est: boolean;
}

export type Action = Contract | Operation | BlackOperation | GeneralAction;
export type ActionIdFor<ActionType extends Action> = Pick<ActionType, "type" | "name">;

export type ActionIdentifier =
  | ActionIdFor<Contract>
  | ActionIdFor<Operation>
  | ActionIdFor<BlackOperation>
  | ActionIdFor<GeneralAction>;

export type LevelableAction = Contract | Operation;
