import type { BlackOperation } from "./Actions/BlackOperation";
import type { Contract } from "./Actions/Contract";
import type { Operation } from "./Actions/Operation";
import type { GeneralAction } from "./Actions/GeneralAction";
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

export type Action = Contract | Operation | BlackOperation | GeneralAction;

export type ActionIdentifier =
  | { type: BladeActionType.blackOp; name: BladeBlackOpName }
  | { type: BladeActionType.contract; name: BladeContractName }
  | { type: BladeActionType.operation; name: BladeOperationName }
  | { type: BladeActionType.general; name: BladeGeneralActionName };

export type LevelableAction = Contract | Operation;
