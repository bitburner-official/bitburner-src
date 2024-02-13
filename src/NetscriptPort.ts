import { Settings } from "./Settings/Settings";
import { NetscriptPort } from "@nsdefs";
import { NetscriptPorts } from "./NetscriptWorker";
import { PositiveInteger } from "./types";

type Resolver = () => void;
const emptyPortData = "NULL PORT DATA";
/** The object property is for typechecking and is not present at runtime */
export type PortNumber = PositiveInteger & { __PortNumber: true };

function isObject(value: unknown): value is Object {
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
  data: any[] = [];
  resolver: Resolver | null = null;
  promise: Promise<void> | null = null;
  add(data: any): any {
    this.data.push(data);
    if (!this.resolver) return;
    this.resolver();
    this.resolver = null;
    this.promise = null;
  }
}
export function portHandle(n: PortNumber): NetscriptPort {
  return {
    write: (value: unknown) => writePort(n, value),
    tryWrite: (value: unknown) => tryWritePort(n, value),
    read: () => readPort(n),
    peek: () => peekPort(n),
    nextWrite: () => nextPortWrite(n),
    full: () => isFullPort(n),
    empty: () => isEmptyPort(n),
    clear: () => clearPort(n),
  };
}

export function writePort(n: PortNumber, value: unknown): any {
  const port = getPort(n);
  // Primitives don't need to be cloned.
  port.add(isObject(value) ? structuredClone(value) : value);
  if (port.data.length > Settings.MaxPortCapacity) return port.data.shift();
  return null;
}

export function tryWritePort(n: PortNumber, value: unknown): boolean {
  const port = getPort(n);
  if (port.data.length >= Settings.MaxPortCapacity) return false;
  // Primitives don't need to be cloned.
  port.add(isObject(value) ? structuredClone(value) : value);
  return true;
}

export function readPort(n: PortNumber): any {
  const port = NetscriptPorts.get(n);
  if (!port || !port.data.length) return emptyPortData;
  const returnVal = port.data.shift();
  if (!port.data.length && !port.resolver) NetscriptPorts.delete(n);
  return returnVal;
}

export function peekPort(n: PortNumber): any {
  const port = NetscriptPorts.get(n);
  if (!port || !port.data.length) return emptyPortData;
  // Needed to avoid exposing internal objects.
  return isObject(port.data[0]) ? structuredClone(port.data[0]) : port.data[0];
}

export function nextPortWrite(n: PortNumber) {
  const port = getPort(n);
  if (!port.promise) port.promise = new Promise<void>((res) => (port.resolver = res));
  return port.promise;
}

function isFullPort(n: PortNumber) {
  const port = NetscriptPorts.get(n);
  if (!port) return false;
  return port.data.length >= Settings.MaxPortCapacity;
}

function isEmptyPort(n: PortNumber) {
  const port = NetscriptPorts.get(n);
  if (!port) return true;
  return port.data.length === 0;
}

export function clearPort(n: PortNumber) {
  const port = NetscriptPorts.get(n);
  if (!port) return;
  if (!port.resolver) NetscriptPorts.delete(n);
  port.data.length = 0;
}
