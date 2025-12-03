import { NetscriptPort } from "@nsdefs";
import { PortHandle } from "../../NetscriptPort";
import { getNextStdinHandle } from "../Pipe";

export const DATA_STREAM_CLOSED = "DATA_STREAM_CLOSED";

export class IOStream implements NetscriptPort {
  isClosed: boolean = false;

  handle: PortHandle = getNextStdinHandle();

  close(): void {
    this.write(DATA_STREAM_CLOSED);
  }

  write(value: any): unknown {
    if (this.isClosed) {
      return;
    }
    if (value === DATA_STREAM_CLOSED) {
      this.isClosed = true;
    }
    return this.handle.write(value);
  }

  tryWrite(value: any): boolean {
    if (this.isClosed) {
      return false;
    }
    this.write(value);
    return true;
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
