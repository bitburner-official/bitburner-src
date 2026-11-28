import type React from "react";
import { BitNodes } from "../BitNode/BitNode";

export class SourceFile {
  info: React.JSX.Element;
  n: number;
  name: string;

  constructor(number: number, info: React.JSX.Element) {
    const bitnodeKey = "BitNode" + number;
    const bitnode = BitNodes[bitnodeKey];
    if (bitnode == null) {
      throw new Error("Invalid Bit Node for this Source File");
    }

    this.n = number;
    this.name = `Source-File ${number}: ${bitnode.name}`;
    this.info = info;
  }
}
