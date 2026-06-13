import type { SaveData, Unknownify } from "../types";
import type { Result } from "@nsdefs";

// This function is empty because Unknownify<T> is a typesafe assertion on any object with no runtime checks needed.
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function assertLoadingType<T extends object>(val: object): asserts val is Unknownify<T> {}

export class TypeAssertionError extends Error {
  friendlyType: string;

  constructor(message: string, friendlyType: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    this.friendlyType = friendlyType;
  }
}

/** Function for providing custom error message to throw for a type assertion.
 * @param v: Value to assert type of
 * @param assertFn: Typechecking function to use for asserting type of v.
 * @param msgFn: Function to use to generate an error message if an error is produced. */
export function assert<T>(
  v: unknown,
  assertFn: (v: unknown) => asserts v is T,
  msgFn: (type: string) => string,
): asserts v is T {
  try {
    assertFn(v);
  } catch (e) {
    if (e instanceof TypeAssertionError) {
      throw msgFn(e.friendlyType);
    }
    const type = typeof e === "string" ? e : "unknown";
    throw msgFn(type);
  }
}

/** Returns the friendlyType of v. arrays are "array" and null is "null". */
export function getFriendlyType(v: unknown): string {
  return v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
}

export function isObject(v: unknown): v is Record<string, unknown> {
  return getFriendlyType(v) === "object";
}

/** For non-objects, and for array/null, throws an error with the friendlyType of v. */
export function assertObject(v: unknown): asserts v is Record<string, unknown> {
  const type = getFriendlyType(v);
  if (type !== "object") {
    console.error("The value is not an object. Value:", v);
    throw new TypeAssertionError(
      `The value is not an object. Its type is ${type}. Its string value is ${String(v)}.`,
      type,
    );
  }
}

/** For non-string, throws an error with the friendlyType of v. */
export function assertString(v: unknown): asserts v is string {
  const type = getFriendlyType(v);
  if (type !== "string") {
    console.error("The value is not a string. Value:", v);
    throw new TypeAssertionError(`The value is not an string. Its type is ${type}.`, type);
  }
}

/** For non-array, throws an error with the friendlyType of v. */
export function assertArray(v: unknown): asserts v is unknown[] {
  if (!Array.isArray(v)) {
    console.error("The value is not an array. Value:", v);
    const type = getFriendlyType(v);
    throw new TypeAssertionError(`The value is not an array. Its type is ${type}.`, type);
  }
}

export function assertNumberArray(unknownData: unknown, assertFinite = false): asserts unknownData is number[] {
  assertArray(unknownData);
  for (const value of unknownData) {
    if (assertFinite) {
      if (!Number.isFinite(value)) {
        console.error("The array contains a value that is not a finite number. Array:", unknownData);
        throw new Error(`${value} is not a number.`);
      }
    } else {
      if (typeof value !== "number") {
        console.error("The array contains a value that is not a number. Array:", unknownData);
        throw new Error(`${value} is not a number.`);
      }
    }
  }
}

export function validateSaveData(unknownData: unknown): Result {
  if (unknownData == null) {
    return { success: false, message: `Save data is ${unknownData}` };
  }

  if (unknownData === "") {
    return { success: false, message: "Save data is an empty string" };
  }
  if (typeof unknownData === "string") {
    return { success: true };
  }

  if (!(unknownData instanceof Uint8Array)) {
    console.error(unknownData);
    return { success: false, message: "Save data is not an instance of Uint8Array" };
  }
  if (unknownData.length === 0) {
    return { success: false, message: "Save data is an empty Uint8Array" };
  }
  if (!(unknownData.buffer instanceof ArrayBuffer)) {
    console.error(unknownData.buffer);
    return { success: false, message: "Save data is a Uint8Array, but its buffer is not an ArrayBuffer" };
  }

  return { success: true };
}

export function isSaveData(unknownData: unknown): unknownData is SaveData {
  return validateSaveData(unknownData).success;
}

export function assertSaveData(unknownData: unknown): asserts unknownData is SaveData {
  if (typeof unknownData !== "string" && !(unknownData instanceof Uint8Array)) {
    console.error(unknownData);
    throw new Error(`Invalid save data. Its type is ${getFriendlyType(unknownData)}.`);
  }
  if (unknownData instanceof Uint8Array && !(unknownData.buffer instanceof ArrayBuffer)) {
    console.error(unknownData);
    throw new Error("Invalid save data. It's Uint8Array, but its buffer is not ArrayBuffer.");
  }
}

/**
 * This function only narrows down the type to "number" at compile time, but it guarantees the value is a finite number
 * at runtime.
 */
export function assertFiniteNumber(v: unknown): asserts v is number {
  if (!Number.isFinite(v)) {
    console.error("The value is not a finite number. Value:", v);
    const type = getFriendlyType(v);
    throw new TypeAssertionError(`The value is not a finite number. Its type is ${type}.`, type);
  }
}

export function assertNonNullish<T>(v: unknown): asserts v is NonNullable<T> {
  if (v === null || v === undefined) {
    console.error("The value is nullish. Value:", v);
    const type = getFriendlyType(v);
    throw new TypeAssertionError(`The value is nullish. Its type is ${type}.`, type);
  }
}
