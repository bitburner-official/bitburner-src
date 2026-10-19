import { IOStream } from "./IOStream";
import { Terminal } from "../../Terminal";
import { Output, RawOutput, Link } from "../OutputTypes";
import { stringify } from "./utils";
import { isValidElement } from "react";

export class StdIO {
  stdin: WeakRef<IOStream> | null = null;

  stdout: IOStream | null;

  constructor(stdin: IOStream | null, stdout: IOStream | null = new IOStream()) {
    if (stdin) {
      this.stdin = new WeakRef(stdin);
    }
    this.stdout = stdout;
  }

  // Async iterator to read from stdin
  async *[Symbol.asyncIterator]() {
    const stdin = this.stdin?.deref();
    if (!stdin || (stdin.isClosed && stdin.empty())) {
      return;
    }
    while (!stdin.isClosed || !stdin.empty()) {
      if (stdin.empty() && !stdin.isClosed) {
        await stdin.nextWrite();
      }
      yield stdin.read();
    }
  }

  // Read from stdin via the async iterator
  read() {
    return this[Symbol.asyncIterator]();
  }

  getAllCurrentStdin(includeNewlines = true): string {
    const stdin = this.stdin?.deref();
    if (!stdin) {
      return "";
    }
    const inputs: string[] = [];
    while (!stdin.empty()) {
      const input = stdin.read();
      if (input === null) {
        break;
      }
      inputs.push(stringify(input));
    }
    return inputs.map((i) => `${i}${includeNewlines ? "\n" : ""}`).join("");
  }

  write(data: unknown): unknown {
    if (this.stdout) {
      return this.stdout.write(stringify(data, true));
    }
    // If there is no stdout, write to the terminal
    if (data instanceof Output || data instanceof Link || data instanceof RawOutput) {
      return Terminal.terminalOutput(data);
    }
    if (isValidElement(data)) {
      return Terminal.terminalOutput(new RawOutput(data));
    }
    Terminal.printAndBypassPipes(stringify(data));
  }

  close(): void {
    this.stdout?.close();
    this.stdin?.deref()?.close();
  }
}
