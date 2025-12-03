import { IOStream } from "./IOStream";

// todo: registry
export const StdIORegistry = new FinalizationRegistry((name: string) => {
  console.log(`StdIO instance ${name} has been garbage collected`);
});

export class StdIO {
  stdin: WeakRef<IOStream> | null = null;

  stdout: IOStream;

  constructor(stdin: IOStream | null, stdout: IOStream = new IOStream()) {
    if (stdin) {
      this.stdin = new WeakRef(stdin);
    }
    this.stdout = stdout;
    const id = `StdIO-${Date.now()}`;
    StdIORegistry.register(this, id);
    //console.log(`Created StdIO instance ${id}`);
  }

  // Async iterator to read from stdin
  async *[Symbol.asyncIterator]() {
    const stdin = this.stdin?.deref();
    if (!stdin || stdin.isClosed) {
      return;
    }
    while (!stdin.isClosed) {
      if (stdin.empty()) {
        await stdin.nextWrite();
      }
      yield stdin.read();
    }
  }

  read() {
    return this[Symbol.asyncIterator]();
  }
}
