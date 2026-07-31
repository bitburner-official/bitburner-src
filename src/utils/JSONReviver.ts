/* Generic toJSON and fromJSON functions used for saving and loading objects */
import { assertObject } from "./TypeAssertion";

export interface IReviverValue<T = unknown> {
  ctor: string;
  data: T;
}

/**
 * A generic "toJSON" function that creates the data expected by Reviver.
 *
 * @param ctorName String name of the constructor, part of the reviver JSON.
 * @param obj      The object to convert to stringified data in the reviver JSON.
 * @param keys     If provided, only these keys will be saved to the reviver JSON data. */
export function Generic_toJSON<T extends Record<string, any>>(
  ctorName: string,
  obj: T,
  keys: readonly string[] | null,
): IReviverValue {
  if (keys == null) {
    // Spread-syntax is generally the fastest way to shallow-clone an object.
    // This copies enumerable own properties, the same as the Object.entries()
    // loop that it replaced.
    return { ctor: ctorName, data: { ...obj } };
  }
  // keys provided: only save data for the provided keys
  const data = {} as Record<string, unknown>;
  for (const key of keys) {
    data[key] = obj[key];
  }
  return { ctor: ctorName, data: data };
}

/**
 * A generic "fromJSON" function for use with Reviver: Just calls the
 * constructor function with no arguments, then applies all of the
 * key/value pairs from the raw data to the instance. Only useful for
 * constructors that can be reasonably called without arguments!
 *
 * @param ctor The constructor to call
 * @param data The saved data to restore to the constructed object
 * @param keys If provided, only these keys will be restored from data.
 * @returns    The object */
export function Generic_fromJSON<T extends object>(
  ctor: new () => T,
  data: unknown,
  keys: readonly string[] | null,
): T {
  assertObject(data);
  const obj = new ctor();
  if (keys == null) {
    // This is an unsafe assignment. We may load data with wrong types at runtime.
    return Object.assign(obj, data) as T;
  }
  // If keys were provided, just load the provided keys (if they are in the data)
  for (const key of keys) {
    const val = data[key];
    if (val !== undefined) {
      // This is an unsafe assignment. We may load data with wrong types at runtime.
      (obj as Record<string, unknown>)[key] = val;
    }
  }
  return obj;
}
