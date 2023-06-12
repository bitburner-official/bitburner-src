import type { CompletedProgramName } from "@enums";
import { ProgramFilePath, asProgramFilePath } from "../Paths/ProgramFilePath";
import { BaseServer } from "../Server/BaseServer";

export interface IProgramCreate {
  level: number;
  req(): boolean; // Function that indicates whether player meets requirements
  time: number;
  tooltip: string;
}
interface ProgramConstructorParams {
  name: CompletedProgramName;
  create: IProgramCreate | null;
  run: (args: string[], server: BaseServer) => void;
}

export class Program {
  name: ProgramFilePath & CompletedProgramName;
  create: IProgramCreate | null;
  run: (args: string[], server: BaseServer) => void;

  constructor({ name, create, run }: ProgramConstructorParams) {
    this.name = asProgramFilePath(name);
    this.create = create;
    this.run = run;
  }
}
