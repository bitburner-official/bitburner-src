import { NetscriptPort } from "@nsdefs";
import { getPort, PortHandle, PortNumber } from "../../NetscriptPort";
import { allocateStdInHandle } from "./utils";

export class IOStream implements NetscriptPort {
  constructor(portNumber: PortNumber | null = null) {
    this.#handle = portNumber ? new PortHandle(portNumber) : allocateStdInHandle();
  }
  #handle: PortHandle;

  #isClosed: boolean = false;
  get isClosed(): boolean {
    return this.#isClosed;
  }

  /** True once the stream is closed and everything written to it has been read */
  get isExhausted(): boolean {
    return this.#isClosed && this.empty();
  }

  close(): void {
    this.write(null);
  }

  write(value: any): unknown {
    if (this.#isClosed) {
      return;
    }
    if (value === null) {
      this.#isClosed = true;
    }
    const port = getPort(this.#handle.n);
    port.add(value);
    return null;
  }

  tryWrite(value: any): boolean {
    if (this.#isClosed) {
      return false;
    }
    return this.write(value) === null;
  }

  clear(): void {
    this.#handle.clear();
  }

  empty(): boolean {
    return this.#handle.empty();
  }

  full(): boolean {
    return false;
  }

  nextWrite(): Promise<void> {
    if (this.#isClosed) {
      return Promise.resolve();
    }
    return this.#handle.nextWrite();
  }

  peek(): unknown {
    if (this.isExhausted) {
      return null;
    }
    return this.#handle.peek();
  }

  read(): unknown {
    if (this.isExhausted) {
      return null;
    }
    return this.#handle.read();
  }
}
