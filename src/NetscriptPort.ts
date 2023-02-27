import { Settings } from "./Settings/Settings";
import { NetscriptPort } from "@nsdefs";
import { NetscriptPorts } from "./NetscriptWorker";

type PortData = string | number;
type Resolver = () => void;

function getPort(n: number) {
  let port = NetscriptPorts.get(n);
  if (port) return port;
  port = new Port();
  NetscriptPorts.set(n, port);
  return port;
}

export function portHandle(n: number): NetscriptPort {
  return {
    write: (value: unknown) => getPort(n).write(value),
    tryWrite: (value: unknown) => getPort(n).tryWrite(value),
    read: () => getPort(n).read(),
    peek: () => getPort(n).peek(),
    nextWrite: () => getPort(n).nextWrite(),
    full: () => getPort(n).full(),
    empty: () => getPort(n).empty(),
    clear: () => getPort(n).clear(),
  };
}

export class Port implements NetscriptPort {
  data: PortData[] = [];
  resolvers: Resolver[] = [];
  write(value: unknown): PortData | null {
    if (typeof value !== "number" && typeof value !== "string") {
      throw new Error(
        `port.write: Tried to write type ${typeof value}. Only string and number types may be written to ports.`,
      );
    }
    this.data.push(value);
    while (this.resolvers.length > 0) {
      (this.resolvers.pop() as Resolver)();
    }
    if (this.data.length > Settings.MaxPortCapacity) {
      return this.data.shift() as PortData;
    }
    return null;
  }
  tryWrite(value: unknown): boolean {
    if (typeof value != "number" && typeof value != "string") {
      throw new Error(
        `port.write: Tried to write type ${typeof value}. Only string and number types may be written to ports.`,
      );
    }
    if (this.data.length >= Settings.MaxPortCapacity) return false;
    this.data.push(value);
    while (this.resolvers.length > 0) (this.resolvers.pop() as Resolver)();
    return true;
  }
  read(): PortData {
    if (this.data.length === 0) return "NULL PORT DATA";
    return this.data.shift() as PortData;
  }
  peek(): PortData {
    if (this.data.length === 0) return "NULL PORT DATA";
    return this.data[0];
  }
  nextWrite() {
    return new Promise((res) => this.resolvers.push(res as Resolver)) as Promise<void>;
  }
  full() {
    return this.data.length >= Settings.MaxPortCapacity;
  }
  empty() {
    return this.data.length === 0;
  }
  clear() {
    this.data.length = 0;
  }
}
