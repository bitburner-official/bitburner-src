import type { FactionName } from "@enums";
import { codingContractTypesMetadata } from "./data/codingcontracttypes";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "./utils/JSONReviver";
import { CodingContractEvent } from "./ui/React/CodingContractModal";
import { ContractFilePath, resolveContractFilePath } from "./Paths/ContractFilePath";

/* Contract Types */
export const CodingContractTypes = Object.fromEntries(codingContractTypesMetadata.map((x) => [x.name, x]));

// Numeric enum
/** Enum representing the different types of rewards a Coding Contract can give */
export enum CodingContractRewardType {
  FactionReputation,
  FactionReputationAll,
  CompanyReputation,
  Money, // This must always be the last reward type
}

// Numeric enum
/** Enum representing the result when trying to solve the Contract */
export enum CodingContractResult {
  Success,
  Failure,
  Cancelled,
}

/** A class that represents the type of reward a contract gives */
export type ICodingContractReward =
  | {
      type: CodingContractRewardType.Money;
    }
  | {
      type: CodingContractRewardType.FactionReputationAll;
    }
  | {
      type: CodingContractRewardType.CompanyReputation;
      name: string;
    }
  | {
      type: CodingContractRewardType.FactionReputation;
      name: FactionName;
    };

/**
 * A Coding Contract is a file that poses a programming-related problem to the Player.
 * The player receives a reward if the problem is solved correctly
 */
export class CodingContract {
  /* Relevant state for the contract's problem */
  state: unknown;

  /* Contract's filename */
  fn: ContractFilePath;

  /* Describes the reward given if this Contract is solved. The reward is actually
       processed outside of this file */
  reward: ICodingContractReward | null;

  /* Number of times the Contract has been attempted */
  tries = 0;

  /* String representing the contract's type. Must match type in ContractTypes */
  type: string;

  constructor(fn = "default.cct", type = "Find Largest Prime Factor", reward: ICodingContractReward | null = null) {
    const path = resolveContractFilePath(fn);
    if (!path) throw new Error(`Bad file path while creating a coding contract: ${fn}`);
    if (!CodingContractTypes[type]) {
      throw new Error(`Error: invalid contract type: ${type} please contact developer`);
    }

    this.fn = path;
    this.type = type;
    this.state = CodingContractTypes[type].generate();
    this.reward = reward;
  }

  getData(): unknown {
    const func = CodingContractTypes[this.type].getData;
    return func ? func(this.state) : this.state;
  }

  getDescription(): string {
    return CodingContractTypes[this.type].desc(this.getData()).replaceAll("&nbsp;", " ");
  }

  getDifficulty(): number {
    return CodingContractTypes[this.type].difficulty;
  }

  getMaxNumTries(): number {
    return CodingContractTypes[this.type].numTries ?? 10;
  }

  getType(): string {
    return this.type;
  }

  isSolution(solution: string): boolean {
    return CodingContractTypes[this.type].solver(this.state, solution);
  }

  /** Creates a popup to prompt the player to solve the problem */
  async prompt(): Promise<CodingContractResult> {
    return new Promise<CodingContractResult>((resolve) => {
      CodingContractEvent.emit({
        c: this,
        onClose: () => {
          resolve(CodingContractResult.Cancelled);
        },
        onAttempt: (val: string) => {
          if (this.isSolution(val)) {
            resolve(CodingContractResult.Success);
          } else {
            resolve(CodingContractResult.Failure);
          }
        },
      });
    });
  }

  /** Serialize the current file to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("CodingContract", this);
  }

  /** Initializes a CodingContract from a JSON save state. */
  static fromJSON(value: IReviverValue): CodingContract {
    // In previous versions, there was a data field instead of a state field.
    if ("data" in value.data) {
      value.data.state = value.data.data;
      delete value.data.data;
    }
    return Generic_fromJSON(CodingContract, value.data);
  }
}

constructorsForReviver.CodingContract = CodingContract;
