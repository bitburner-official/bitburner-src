import { ProgramFilePath } from "../Paths/ProgramFilePath";

export class DarkWebItem {
  program: ProgramFilePath;
  price: number;
  description: string;

  constructor(program: ProgramFilePath, price: number, description: string) {
    this.program = program;
    this.price = price;
    this.description = description;
  }
}
