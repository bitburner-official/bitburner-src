import { ProgramFilePath } from "../Paths/ProgramFilePath";
import { BaseServer } from "../Server/BaseServer";
import { programsMetadata } from "./data/ProgramsMetadata";

export interface IProgramCreate {
  level: number;
  req(): boolean; // Function that indicates whether player meets requirements
  time: number;
  tooltip: string;
}

export class Program {
  name = programsMetadata[0].name;
  create: IProgramCreate | null;
  run: (args: string[], server: BaseServer) => void;

  constructor(name: ProgramFilePath, create: IProgramCreate | null, run: (args: string[], server: BaseServer) => void) {
    this.name = name;
    this.create = create;
    this.run = run;
  }
}
