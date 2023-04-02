/* Generic Reviver, toJSON, and fromJSON functions used for saving and loading objects */

import { ObjectValidator, validateObject } from "./Validator";

export interface IReviverValue {
  ctor: string;
  data: any;
}

/**
 * A generic "smart reviver" function.
 * Looks for object values with a `ctor` property and a `data` property.
 * If it finds them, and finds a matching constructor, it hands
 * off to that `fromJSON` function, passing in the value. */
export function Reviver(key: string, value: unknown): any {
  if (typeof value !== "object" || value === null) return value;
  // @ts-ignore We know it's an object here, just checking type of object properties to type validate.
  if (typeof value.ctor !== "string" || typeof value.data === "undefined") return value;
  const typedValue = value as IReviverValue;

  const ctor = Reviver.constructors[typedValue.ctor];
  if (!ctor) {
    // Known missing constructors with special handling.
    switch (typedValue.ctor) {
      case "AllServersMap":
        console.warn("Converting AllServersMap for v0.43.1");
        return typedValue.data;
    }
    // Missing constructor with no special handling. Throw error.
    throw new Error(`Could not locate constructor named ${typedValue.ctor}. If the save data is valid, this is a bug.`);
  }

  const obj = ctor.fromJSON(typedValue);
  if (ctor.validationData !== undefined) {
    validateObject(obj, ctor.validationData);
  }
  return obj;
}

export namespace Reviver {
  export const constructors: Partial<
    Record<
      string,
      Function & {
        fromJSON: (value: IReviverValue) => any;
        validationData?: ObjectValidator<any>;
      }
    >
  > = {};
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
  keys?: readonly (keyof T)[],
): IReviverValue {
  const data = {} as T;
  // keys provided: only save data for the provided keys
  if (keys) {
    for (const key of keys) data[key] = obj[key];
    return { ctor: ctorName, data: data };
  }
  // no keys provided: save all own keys of the object
  for (const key in obj) data[key] = obj[key];
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
  // data can actually be anything. We're just pretending it has the right keys for T. Save data is not type validated.
  data: Record<keyof T, any>,
  keys?: readonly (keyof T)[],
): T {
  const obj = new ctor();
  // If keys were provided, just load the provided keys (if they are in the data)
  if (keys) {
    for (const key of keys) if (key in data) obj[key] = data[key];
    return obj;
  }
  // No keys provided: load every key in data
  for (const key in data) obj[key] = data[key];
  return obj;
}
