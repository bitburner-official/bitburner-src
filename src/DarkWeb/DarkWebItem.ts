import type { CompletedProgramName } from "@enums";

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
