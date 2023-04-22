import type { CompletedProgramName } from "../Programs/Programs";

export class DarkWebItem {
  program: CompletedProgramName;
  price: number;
  description: string;

  constructor(program: CompletedProgramName, price: number, description: string) {
    this.program = program;
    this.price = price;
    this.description = description;
  }
}
