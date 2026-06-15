import { constructorsForReviver, isReviverValue } from "./JSONReviver";
import { validateObject } from "./Validator";

export class JSONReviverError extends Error {
  ctor: string;
  constructor(message: string, ctor: string) {
    super(message);
    this.name = this.constructor.name;
    this.ctor = ctor;
  }
}

export function makeReviverWithContext(context?: string[]): (_key: string, value: unknown) => any {
  /**
   * A generic "smart reviver" function.
   * Looks for object values with a `ctor` property and a `data` property.
   * If it finds them, and finds a matching constructor, it hands
   * off to that `fromJSON` function, passing in the value. */
  function reviverWithContext(_key: string, value: unknown): any {
    if (!isReviverValue(value)) {
      return value;
    }
    const ctor = constructorsForReviver[value.ctor];
    if (!ctor) {
      // Known missing constructors with special handling.
      switch (value.ctor) {
        case "AllServersMap": // Reviver removed in v0.43.1
        case "Message": // Reviver removed in v1.6.4
        case "Industry": // No longer part of save data since v2.3.0
        case "Employee": // Entire object removed from game in v2.2.0 (employees abstracted)
        case "Company": // Reviver removed in v2.6.1
        case "Faction": // Reviver removed in v2.6.1
        case "ActionIdentifier": // No longer a class as of v2.6.1
          console.warn(`Legacy load type ${value.ctor} converted to expected format while loading.`);
          return value.data;
      }
      // Missing constructor with no special handling. Throw error.
      throw new JSONReviverError(`Could not locate constructor named ${value.ctor}.`, value.ctor);
    }

    const obj = ctor.fromJSON(value, context);
    if (ctor.validationData !== undefined) {
      validateObject(obj, ctor.validationData);
    }
    return obj;
  }
  return reviverWithContext;
}

export const Reviver = makeReviverWithContext();
