import type { PromisePair } from "../Types/Promises";
import type { IReviverValue } from "../utils/JSONReviver";
import type { Task } from "@nsdefs";

export abstract class BaseWork {
  // Make this field private to ensure it's not included in the save data.
  #nextCompletionPromisePair: PromisePair<void> = { promise: null, resolve: null };

  get nextCompletion(): Promise<void> {
    if (!this.#nextCompletionPromisePair.promise) {
      this.#nextCompletionPromisePair.promise = new Promise((r) => (this.#nextCompletionPromisePair.resolve = r));
    }
    return this.#nextCompletionPromisePair.promise;
  }

  resolveNextCompletion(): void {
    if (this.#nextCompletionPromisePair.resolve) {
      this.#nextCompletionPromisePair.resolve();
      this.#nextCompletionPromisePair.resolve = null;
      this.#nextCompletionPromisePair.promise = null;
    }
  }
}

export abstract class PlayerBaseWork extends BaseWork {
  type: WorkType;
  singularity: boolean;
  cyclesWorked: number;
  constructor(type: WorkType, singularity: boolean) {
    super();
    this.type = type;
    this.singularity = singularity;
    this.cyclesWorked = 0;
  }

  abstract process(cycles: number): boolean;
  /**
   * Child classes that override this function must call `this.resolveNextCompletion()` when appropriate to ensure the
   * completion promise is resolved.
   */
  finish(__cancelled: boolean, __suppressDialog?: boolean): void {
    this.resolveNextCompletion();
  }
  abstract APICopy(): Task;
  abstract toJSON(): IReviverValue;
}

export enum WorkType {
  CRIME = "CRIME",
  CLASS = "CLASS",
  CREATE_PROGRAM = "CREATE_PROGRAM",
  GRAFTING = "GRAFTING",
  FACTION = "FACTION",
  COMPANY = "COMPANY",
}
