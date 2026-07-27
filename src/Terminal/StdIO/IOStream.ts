import { NetscriptPort } from "@nsdefs";
import { getPort, PortHandle } from "../../NetscriptPort";
import { getNextStdinHandle } from "./utils";

const MAX_PIPE_SIZE = 1000;

export class IOStream implements NetscriptPort {
  isClosed: boolean = false;

  handle: PortHandle = getNextStdinHandle();

  close(): void {
    this.write(null);
  }

  write(value: any): unknown {
    if (this.isClosed) {
      return;
    }
    if (value === null) {
      this.isClosed = true;
    }
    const port = getPort(this.handle.n);
    port.add(value);
    if (port.data.length > MAX_PIPE_SIZE) return port.data.shift();
    return null;
  }

  tryWrite(value: any): boolean {
    if (this.isClosed) {
      return false;
    }
    return this.write(value) !== null;
  }

  clear(): void {
    this.handle.clear();
  }

  empty(): boolean {
    return this.handle.empty();
  }

  full(): boolean {
    return this.handle.full();
  }

  nextWrite(): Promise<void> {
    return this.handle.nextWrite();
  }

  peek(): unknown {
    return this.handle.peek();
  }

  read(): unknown {
    return this.handle.read();
  }
}
