import { BlackOperation, Contract, GeneralAction, Operation } from "./Actions";

export interface SuccessChanceParams {
  /** Whether the success chance should be based on estimated statistics */
  est: boolean;
}

type AvailabilitySuccess<T extends object> = { available: true } & T;
type AvailabilityFailure = { available?: undefined; error: string };
export type Availability<T extends object = object> = AvailabilitySuccess<T> | AvailabilityFailure;

type AttemptSuccess<T extends object> = { success: true; message?: string } & T;
type AttemptFailure = { success?: undefined; message: string };
export type Attempt<T extends object = object> = AttemptSuccess<T> | AttemptFailure;

export type Action = Contract | Operation | BlackOperation | GeneralAction;
export type TypeOfActionId<ActionType extends Action> = Pick<ActionType, "type" | "name">;

export type ActionIdentifier =
  | TypeOfActionId<Contract>
  | TypeOfActionId<Operation>
  | TypeOfActionId<BlackOperation>
  | TypeOfActionId<GeneralAction>;

export type LevelableAction = Contract | Operation;
