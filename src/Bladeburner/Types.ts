import type { BlackOperation, Contract, GeneralAction, Operation } from "./Actions";
import type {
  BladeActionType,
  BladeBlackOpName,
  BladeContractName,
  BladeOperationName,
  BladeGeneralActionName,
} from "@enums";

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

export type ActionIdentifier =
  | { type: BladeActionType.blackOp; name: BladeBlackOpName }
  | { type: BladeActionType.contract; name: BladeContractName }
  | { type: BladeActionType.operation; name: BladeOperationName }
  | { type: BladeActionType.general; name: BladeGeneralActionName };

export type LevelableAction = Contract | Operation;
