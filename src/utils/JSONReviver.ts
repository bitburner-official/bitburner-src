/* Generic Reviver, toJSON, and fromJSON functions used for saving and loading objects */
import { ObjectValidator, validateObject } from "./Validator";
import { JSONMap, JSONSet } from "../Types/Jsonable";
import { loadActionIdentifier } from "../Bladeburner/utils/loadActionIdentifier";

type JsonableClass = (new () => { toJSON: () => IReviverValue }) & {
  fromJSON: (value: IReviverValue) => any;
  validationData?: ObjectValidator<any>;
};

export interface IReviverValue<T = any> {
  ctor: string;
  data: T;
}
function isReviverValue(value: unknown): value is IReviverValue {
  return (
    typeof value === "object" && value !== null && "ctor" in value && typeof value.ctor === "string" && "data" in value
  );
}

/**
 * A generic "smart reviver" function.
 * Looks for object values with a `ctor` property and a `data` property.
 * If it finds them, and finds a matching constructor, it hands
 * off to that `fromJSON` function, passing in the value. */
export function Reviver(_key: string, value: unknown): any {
  if (!isReviverValue(value)) return value;
  const ctor = constructorsForReviver[value.ctor];
  if (!ctor) {
    // Known missing constructors with special handling.
    switch (value.ctor) {
      case "AllServersMap": // Reviver removed in v0.43.1
      case "Industry": // No longer part of save data since v2.3.0
      case "Employee": // Entire object removed from game in v2.2.0 (employees abstracted)
      case "Company": // Reviver removed in v2.6.1
      case "Faction": // Reviver removed in v2.6.1
        console.warn(`Legacy load type ${value.ctor} converted to expected format while loading.`);
        return value.data;
      case "ActionIdentifier": // No longer a class as of v2.6.1
        return loadActionIdentifier(value.data);
    }
    // Missing constructor with no special handling. Throw error.
    throw new Error(`Could not locate constructor named ${value.ctor}. If the save data is valid, this is a bug.`);
  }

  const obj = ctor.fromJSON(value);
  if (ctor.validationData !== undefined) {
    validateObject(obj, ctor.validationData);
  }
  return obj;
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
  // data can actually be anything. We're just pretending it has the right keys for T. Save data is not type validated.
  data: Record<keyof T, any>,
  keys?: readonly (keyof T)[],
): T {
  const obj = new ctor();
  // If keys were provided, just load the provided keys (if they are in the data)
  if (keys) {
    for (const key of keys) {
      const val = data[key];
      if (val !== undefined) obj[key] = val;
    }
    return obj;
  }
  // No keys provided: load every key in data
  for (const [key, val] of Object.entries(data) as [keyof T, T[keyof T]][]) obj[key] = val;
  return obj;
}
