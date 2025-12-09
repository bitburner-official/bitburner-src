import { IOStream } from "./IOStream";
import { stringify } from "./RedirectIO";
import { Terminal } from "../../Terminal";
import { Output, RawOutput, Link } from "../OutputTypes";

export let remaining = 0;
export const registerStdIOInstance = (stdIO: StdIO) => {
  const id = `StdIO-${Math.random().toString(16).slice(2)}`;
  StdIORegistry.register(stdIO, id);
  remaining++;
  console.log(`Created StdIO instance ${id}`);
};
export const StdIORegistry = new FinalizationRegistry((name: string) => {
  remaining--;
  console.log(`StdIO instance ${name} has been garbage collected. Remaining instances: ${remaining}`);
});

export class StdIO {
  stdin: WeakRef<IOStream> | null = null;

  stdout: IOStream | null;

  constructor(stdin: IOStream | null, stdout: IOStream | null = new IOStream()) {
    if (stdin) {
      this.stdin = new WeakRef(stdin);
    }
    this.stdout = stdout;
    registerStdIOInstance(this);
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

  read() {
    return this[Symbol.asyncIterator]();
  }

  write(data: unknown): unknown {
    if (this.stdout) {
      return this.stdout.write(stringify(data, true));
    }
    if (data instanceof Output || data instanceof Link || data instanceof RawOutput) {
      return Terminal.terminalOutput(data);
    }
    Terminal.printAndBypassPipes(stringify(data));
  }

  close(): void {
    this.stdout?.close();
    this.stdin?.deref()?.close();
  }
}
