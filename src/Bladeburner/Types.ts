import type { BlackOperation } from "./Actions/BlackOperation";
import type { Contract } from "./Actions/Contract";
import type { GeneralAction } from "./Actions/GeneralAction";
import type { Operation } from "./Actions/Operation";

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
export type ActionIdFor<ActionType extends Action> = Pick<ActionType, "type" | "name">;

export type ActionIdentifier =
  | ActionIdFor<Contract>
  | ActionIdFor<Operation>
  | ActionIdFor<BlackOperation>
  | ActionIdFor<GeneralAction>;

export type LevelableAction = Contract | Operation;
