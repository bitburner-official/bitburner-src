/* Generic Reviver, toJSON, and fromJSON functions used for saving and loading objects */
import { ObjectValidator } from "./Validator";
import { JSONMap, JSONSet } from "../Types/Jsonable";
import { assertObject } from "./TypeAssertion";

type JsonableClass = (new () => { toJSON: () => IReviverValue }) & {
  fromJSON: (value: IReviverValue) => unknown;
  validationData?: ObjectValidator<any>;
};

export interface IReviverValue<T = unknown> {
  ctor: string;
  data: T;
}

export function isReviverValue(value: unknown): value is IReviverValue {
  return (
    typeof value === "object" && value !== null && "ctor" in value && typeof value.ctor === "string" && "data" in value
  );
}

export const constructorsForReviver: Partial<Record<string, JsonableClass>> = { JSONSet, JSONMap };

/**
 * A generic "toJSON" function that creates the data expected by Reviver.
 *
 * @param ctorName String name of the constructor, part of the reviver JSON.
 * @param obj      The object to convert to stringified data in the reviver JSON.
 * @param keys     If provided, only these keys will be saved to the reviver JSON data. */
export function Generic_toJSON<T extends Record<string, any>>(
  ctorName: string,
  obj: T,
  keys?: readonly (keyof T)[],
): IReviverValue {
  const data = {} as T;
  // keys provided: only save data for the provided keys
  if (keys) {
    for (const key of keys) data[key] = obj[key];
    return { ctor: ctorName, data: data };
  }
  // no keys provided: save all own keys of the object
  for (const [key, val] of Object.entries(obj) as [keyof T, T[keyof T]][]) data[key] = val;
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
export function Generic_fromJSON<T extends Record<string, any>>(
  ctor: new () => T,
  data: unknown,
  keys?: readonly (keyof T)[],
): T {
  assertObject(data);
  const obj = new ctor();
  // If keys were provided, just load the provided keys (if they are in the data)
  if (keys) {
    for (const key of keys) {
      // This cast is safe (T has string keys), but still needed because "keyof T" cannot be used to index data.
      const val = data[key as string];
      if (val !== undefined) {
        // This is an unsafe assignment. We may load data with wrong types at runtime.
        obj[key] = val as T[keyof T];
      }
    }
    return obj;
  }
  // No keys provided: load every key in data
  for (const [key, val] of Object.entries(data) as [keyof T, T[keyof T]][]) {
    // This is an unsafe assignment. We may load data with wrong types at runtime.
    obj[key] = val;
  }
  return obj;
}
