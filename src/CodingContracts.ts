import type { FactionName } from "@enums";
import { codingContractTypesMetadata, DescriptionFunc, GeneratorFunc, SolverFunc } from "./data/codingcontracttypes";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "./utils/JSONReviver";
import { CodingContractEvent } from "./ui/React/CodingContractModal";
import { ContractFilePath, resolveContractFilePath } from "./Paths/ContractFilePath";

/* Represents different types of problems that a Coding Contract can have */
class CodingContractType {
  /** Function that generates a description of the problem */
  desc: DescriptionFunc;

  /** Number that generally represents the problem's difficulty. Bigger numbers = harder */
  difficulty: number;

  /** A function that randomly generates a valid 'data' for the problem */
  generate: GeneratorFunc;

  /** Name of the type of problem */
  name: string;

  /** The maximum number of tries the player gets on this kind of problem before it self-destructs */
  numTries: number;

  /** Stores a function that checks if the provided answer is correct */
  solver: SolverFunc;

  constructor(
    name: string,
    desc: DescriptionFunc,
    gen: GeneratorFunc,
    solver: SolverFunc,
    diff: number,
    numTries: number,
  ) {
    this.name = name;
    this.desc = desc;
    this.generate = gen;
    this.solver = solver;
    this.difficulty = diff;
    this.numTries = numTries;
  }
}

/* Contract Types */
export const CodingContractTypes: Record<string, CodingContractType> = {};

for (const md of codingContractTypesMetadata) {
  CodingContractTypes[md.name] = new CodingContractType(
    md.name,
    md.desc,
    md.gen,
    md.solver,
    md.difficulty,
    md.numTries,
  );
}

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
  /* Relevant data for the contract's problem */
  data: unknown;

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
    this.data = CodingContractTypes[type].generate();
    this.reward = reward;
  }

  getData(): unknown {
    return this.data;
  }

  getDescription(): string {
    return CodingContractTypes[this.type].desc(this.data);
  }

  getDifficulty(): number {
    return CodingContractTypes[this.type].difficulty;
  }

  getMaxNumTries(): number {
    return CodingContractTypes[this.type].numTries;
  }

  getType(): string {
    return CodingContractTypes[this.type].name;
  }

  isSolution(solution: string): boolean {
    return CodingContractTypes[this.type].solver(this.data, solution);
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
    return Generic_fromJSON(CodingContract, value.data);
  }
}

constructorsForReviver.CodingContract = CodingContract;
