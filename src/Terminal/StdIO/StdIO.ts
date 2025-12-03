import { DATA_STREAM_CLOSED, DataStream } from "./DataStream";

// todo: registry
export const StdIORegistry = new FinalizationRegistry((name: string) => {
  console.log(`StdIO instance ${name} has been garbage collected`);
});

export class StdIO {
  stdin: WeakRef<DataStream> | null = null;

  stdout: DataStream;

  constructor(
    stdin: DataStream | null,
    onRead: ((data: any, stdout: DataStream) => Promise<void> | void) | undefined,
    stdout: DataStream = new DataStream(),
  ) {
    if (stdin) {
      this.stdin = new WeakRef(stdin);
    }
    this.stdout = stdout;
    if (onRead) {
      void PullData(this, onRead);
    }
    const id = `StdIO-${Date.now()}`;
    StdIORegistry.register(this, id);
    //console.log(`Created StdIO instance ${id}`);
  }
}

// TODO: docs
async function PullData(stdIO: StdIO, callback: (data: any, stdout: DataStream) => Promise<void> | void) {
  while (stdIO?.stdin && stdIO.stdin.deref() && !stdIO.stdin?.deref()?.closed) {
    while (!stdIO.stdin?.deref()?.empty()) {
      const line = stdIO.stdin.deref()?.read();
      if (line === DATA_STREAM_CLOSED) {
        console.log("StdIO: Detected DATA_STREAM_CLOSED, stopping PullData.");
        return;
      }
      await callback(line, stdIO.stdout);
    }
    await stdIO.stdin.deref()?.nextWrite();
  }
}
