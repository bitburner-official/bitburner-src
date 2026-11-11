import { NetscriptPort } from "@nsdefs";
import { getPort, NetscriptPorts, PortHandle, PortNumber } from "../../NetscriptPort";
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

  /**
   * Ends the stream. The writer closes it so the reader sees the end of the input after reading what's left.
   * The reader passes discardUnread when it's done, to free anything written that it will never read.
   */
  close(discardUnread = false): void {
    if (!discardUnread) {
      this.write(null);
      return;
    }
    this.#isClosed = true;
    const port = NetscriptPorts.get(this.#handle.n);
    if (!port) return;
    NetscriptPorts.delete(this.#handle.n);
    // Wake anything waiting on nextWrite, so it sees the stream has ended
    port.resolver?.();
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
