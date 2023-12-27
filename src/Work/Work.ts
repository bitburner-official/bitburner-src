import type { IReviverValue } from "../utils/JSONReviver";
import type { Task } from "@nsdefs";

export abstract class Work {
  type: WorkType;
  singularity: boolean;
  cyclesWorked: number;

  constructor(type: WorkType, singularity: boolean) {
    this.type = type;
    this.singularity = singularity;
    this.cyclesWorked = 0;
  }

  abstract process(cycles: number): boolean;
  abstract finish(cancelled: boolean, suppressDialog?: boolean): void;
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
