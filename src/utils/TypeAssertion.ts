import type { Unknownify } from "../types";

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
function getFriendlyType(v: unknown): string {
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
