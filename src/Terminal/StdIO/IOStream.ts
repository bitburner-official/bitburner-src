import { NetscriptPort } from "@nsdefs";
import { getPort, NetscriptPorts, PortHandle, PortNumber } from "../../NetscriptPort";
import { getNextStdinHandle } from "./utils";

const MAX_PIPE_SIZE = 1000;

export class IOStream implements NetscriptPort {
  constructor(portNumber: PortNumber | null = null) {
    this.#handle = portNumber ? new PortHandle(portNumber) : getNextStdinHandle();
  }
  #handle: PortHandle;

  #isClosed: boolean = false;
  get isClosed(): boolean {
    return this.#isClosed;
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
    if (port.data.length > MAX_PIPE_SIZE) return port.data.shift();
    return null;
  }

  tryWrite(value: any): boolean {
    if (this.#isClosed || this.full()) {
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
    const port = NetscriptPorts.get(this.#handle.n);
    if (!port) return false;
    return port.data.length >= MAX_PIPE_SIZE;
  }

  nextWrite(): Promise<void> {
    if (this.#isClosed) {
      return Promise.resolve();
    }
    return this.#handle.nextWrite();
  }

  peek(): unknown {
    return this.#handle.peek();
  }

  read(): unknown {
    return this.#handle.read();
  }
}
