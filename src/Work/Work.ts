import { IReviverValue } from "../utils/JSONReviver";
import { APICopyClassWork } from "./ClassWork";
import { APICopyCompanyWork } from "./CompanyWork";
import { APICopyCreateProgramWork } from "./CreateProgramWork";
import { APICopyCrimeWork } from "./CrimeWork";
import { APICopyFactionWork } from "./FactionWork";
import { APICopyGraftingWork } from "./GraftingWork";

export type APICopyWork =
  | APICopyClassWork
  | APICopyCompanyWork
  | APICopyCreateProgramWork
  | APICopyCrimeWork
  | APICopyFactionWork
  | APICopyGraftingWork;

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
  abstract APICopy(): APICopyWork;
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
