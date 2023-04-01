/* Generic Reviver, toJSON, and fromJSON functions used for saving and loading objects */

import { validateObject } from "./Validator";

export interface IReviverValue {
  ctor: string;
  data: any;
}

// A generic "smart reviver" function.
// Looks for object values with a `ctor` property and
// a `data` property. If it finds them, and finds a matching
// constructor that has a `fromJSON` property on it, it hands
// off to that `fromJSON` function, passing in the value.
export function Reviver(key: string, value: IReviverValue | null): any {
  if (value == null) {
    return null;
  }

  if (typeof value === "object" && typeof value.ctor === "string" && typeof value.data !== "undefined") {
    // Compatibility for version v0.43.1
    // TODO Remove this eventually
    if (value.ctor === "AllServersMap") {
      console.warn("Converting AllServersMap for v0.43.1");
      return value.data;
    }

    const ctor = Reviver.constructors[value.ctor];

    if (typeof ctor === "function" && typeof ctor.fromJSON === "function") {
      const obj = ctor.fromJSON(value);
      if (ctor.validationData !== undefined) {
        validateObject(obj, ctor.validationData);
      }
      return obj;
    }
  }
  return value;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Reviver {
  export const constructors: { [key: string]: any } = {};
}

// A generic "toJSON" function that creates the data expected
// by Reviver.
// `ctorName`  The name of the constructor to use to revive it
// `obj`       The object being serialized
// `keys`      (Optional) Array of the properties to serialize,
//             if not given then all of the objects "own" properties
//             that don't have function values will be serialized.
//             (Note: If you list a property in `keys`, it will be serialized
//             regardless of whether it's an "own" property.)
// Returns:    The structure (which will then be turned into a string
//             as part of the JSON.stringify algorithm)
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

// A generic "fromJSON" function for use with Reviver: Just calls the
// constructor function with no arguments, then applies all of the
// key/value pairs from the raw data to the instance. Only useful for
// constructors that can be reasonably called without arguments!
// Providing an array of keys will only restore data from those keys.
// `ctor`      The constructor to call
// `data`      The data to apply
// Returns:    The object
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
