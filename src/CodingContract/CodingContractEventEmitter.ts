import { EventEmitter } from "../utils/EventEmitter";
import type { CodingContract } from "./Contract";

export type CodingContractEventData = {
  codingContract: CodingContract;
  onClose: () => void;
  onAttempt: (answer: string) => void;
};

type CodingContractEvent =
  | {
      type: "run";
      data: CodingContractEventData;
    }
  | {
      type: "close";
    };

export const CodingContractEventEmitter = new EventEmitter<[CodingContractEvent]>();
