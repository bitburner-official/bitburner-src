import type { BlackOperation, Contract, GeneralAction, Operation } from "./Actions";
import type {
  BladeburnerActionType,
  BladeburnerBlackOpName,
  BladeburnerContractName,
  BladeburnerOperationName,
  BladeburnerGeneralActionName,
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
  | { type: BladeburnerActionType.BlackOp; name: BladeburnerBlackOpName }
  | { type: BladeburnerActionType.Contract; name: BladeburnerContractName }
  | { type: BladeburnerActionType.Operation; name: BladeburnerOperationName }
  | { type: BladeburnerActionType.General; name: BladeburnerGeneralActionName };

export type LevelableAction = Contract | Operation;
