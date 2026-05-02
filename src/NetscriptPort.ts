import { Settings } from "./Settings/Settings";
import { NetscriptPort } from "@nsdefs";
import { NetscriptPorts } from "./NetscriptWorker";
import { PositiveInteger } from "./types";

type Resolver = () => void;
const emptyPortData = "NULL PORT DATA";
/** The object property is for typechecking and is not present at runtime */
export type PortNumber = PositiveInteger & { __PortNumber: true };

function isObjectLike(value: unknown): value is object {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

/** Gets the numbered port, initializing it if it doesn't already exist.
 * Only using for functions that write data/resolvers. Use NetscriptPorts.get(n) for */
export function getPort(n: PortNumber) {
  let port = NetscriptPorts.get(n);
  if (port) return port;
  port = new Port();
  NetscriptPorts.set(n, port);
  return port;
}

export class Port {
  data: unknown[] = [];
  resolver: Resolver | null = null;
  promise: Promise<void> | null = null;
  add(data: unknown) {
    let value = data;
    if (isObjectLike(data)) {
      try {
        value = structuredClone(data);
      } catch (ex) {
        throw new Error("You can't send Functions, Promises, NS, or other unserializable data through ports!", {
          cause: ex,
        });
      }
    }
    this.data.push(value);
    if (!this.resolver) return;
    this.resolver();
    this.resolver = null;
    this.promise = null;
  }
}

export class PortHandle implements NetscriptPort {
  n: PortNumber;

  constructor(n: PortNumber) {
    this.n = n;
  }

  write(value: unknown): unknown {
    const port = getPort(this.n);
    // Primitives don't need to be cloned.
    port.add(value);
    if (port.data.length > Settings.MaxPortCapacity) return port.data.shift();
    return null;
  }

  tryWrite(value: unknown): boolean {
    const port = getPort(this.n);
    if (port.data.length >= Settings.MaxPortCapacity) return false;
    // Primitives don't need to be cloned.
    port.add(value);
    return true;
  }

  read(): unknown {
    const port = NetscriptPorts.get(this.n);
    if (!port || !port.data.length) return emptyPortData;
    const returnVal: unknown = port.data.shift();
    if (!port.data.length && !port.resolver) NetscriptPorts.delete(this.n);
    return returnVal;
  }

  peek(): unknown {
    const port = NetscriptPorts.get(this.n);
    if (!port || !port.data.length) return emptyPortData;
    // Needed to avoid exposing internal objects.
    return isObjectLike(port.data[0]) ? structuredClone(port.data[0]) : port.data[0];
  }

  nextWrite(): Promise<void> {
    const port = getPort(this.n);
    if (!port.promise) port.promise = new Promise<void>((res) => (port.resolver = res));
    return port.promise;
  }

  full(): boolean {
    const port = NetscriptPorts.get(this.n);
    if (!port) return false;
    return port.data.length >= Settings.MaxPortCapacity;
  }

  empty(): boolean {
    const port = NetscriptPorts.get(this.n);
    if (!port) return true;
    return port.data.length === 0;
  }

  clear(): void {
    const port = NetscriptPorts.get(this.n);
    if (!port) return;
    if (!port.resolver) NetscriptPorts.delete(this.n);
    port.data.length = 0;
  }
}
