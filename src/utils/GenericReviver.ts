import { type IReviverValue, Generic_fromJSON, Generic_toJSON } from "./JSONReviver";
import { type ObjectValidator, validateObject } from "./Validator";
import { getKeyList } from "./helpers/getKeyList";

/**
 * These functions are used by the save/load system to enable automatic
 * serialization and deserialization of game classes via generic Replacer and
 * Reviver functions. To use this, all saveable classes need a line like this one:
 *
 * static includedKeys = makeSerializable("ClassName", ClassName);
 *
 * There are various increasing levels of customization that can be made to
 * the process:
 *
 * By default, includedKeys is null, which represents all keys will be serialized/deserialized.
 * An optional parameter can be included to customize, like this:
 *
 * static includedKeys = makeSerializable("ClassName", ClassName, { removedKeys: ["dontInclude"] });
 *
 * You can define the instance method jsonReplacer and/or the static method jsonReviver
 * to completely customize the serialization. These usually use the helper methods
 * Generic_toJSON and Generic_fromJSON, which are also what the default implementation
 * uses internally.
 */

/**
 * "tag" is typically the class name, but it doesn't strictly have to be.
 * If a class is renamed, the tag would be kept the same for save stability.
 */
export function makeSerializable(
  tag: string,
  ctor: JsonableClass,
  modifications?: { removedKeys?: readonly string[]; addedKeys?: readonly string[] },
): null | readonly string[] {
  constructorsForReviver[tag] = ctor;
  reverseMap.set(ctor, tag);
  if (modifications) {
    return getKeyList(ctor, modifications);
  }
  return null;
}

export class JSONReviverError extends Error {
  ctor: string;
  constructor(message: string, ctor: string) {
    super(message);
    this.name = this.constructor.name;
    this.ctor = ctor;
  }
}

type JsonableInstance = {
  jsonReplacer?: () => IReviverValue;
  // This is not really part of the interface. It exists to catch accidental
  // definitions of toJSON and error due to mismatched types. Classes should
  // be defining jsonReplacer instead, and this way the mistake is caught at
  // build time.
  toJSON?: (badArgument: number) => number;
};

// These are fields on the class itself, i.e. static functions and the constructor.
type JsonableClass = (new () => JsonableInstance) & {
  // This is a required static field, because it serves as a tag that the
  // class is properly set up.
  includedKeys: readonly string[] | null;
  jsonReviver?: (value: IReviverValue) => unknown;
  validationData?: ObjectValidator<any>;
  // This is not really part of the interface. It exists to catch accidental
  // definitions of fromJSON and error due to mismatched types.
  fromJSON?: (badArgument: number) => number;
};

function isReviverValue(value: unknown): value is IReviverValue {
  return (
    typeof value === "object" && value !== null && "ctor" in value && typeof value.ctor === "string" && "data" in value
  );
}

const constructorsForReviver: Partial<Record<string, JsonableClass>> = {};
// The type of the keys is actually JsonableClass, but we want to be able to
// make lookups with unknown keys, so we expand the type definition.
const reverseMap = new Map<unknown, string>();

/**
 * A generic "smart reviver" function.
 * Looks for object values with a `ctor` property and a `data` property.
 * If it finds them, and finds a matching constructor, it either calls Generic_fromJSON,
 * or hands it off to a specialized `jsonReviver` function.
 */
export function Reviver(_key: string, value: unknown): any {
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

  const obj =
    ctor.jsonReviver === undefined
      ? Generic_fromJSON<Record<string, unknown>>(ctor, value.data, ctor.includedKeys)
      : ctor.jsonReviver(value);
  if (ctor.validationData !== undefined) {
    validateObject(obj, ctor.validationData);
  }
  return obj;
}

/**
 * A generic "smart replacer" function.
 * Looks for object values that we know are specially serializable.
 * If it finds them, it either callse Generic_toJSON, or hands it off
 * to a specialized `jsonReplacer` function.
 */
export function Replacer(_key: string, value: unknown): unknown {
  if (value == null) {
    return value;
  }
  // For any non-null/non-undefined value, it is at least valid to try this
  // property access, so we don't need a typeof. It's even valid for numbers.
  // If there's no such property, we'll get undefined, which won't be found in
  // the map.
  // It's important that we don't ever overwrite `constructor` for our serializable classes.
  // (Data objects are fine, since they would end up finding a value that fails the map lookup.)
  const ctorName = reverseMap.get(value.constructor);
  if (ctorName === undefined) {
    return value;
  }
  // It being in the map asserts that it is the correct type.
  const ctor = value.constructor as JsonableClass;
  // Typescript no-op: This just defines an optional field.
  const maybeReplacer = value as JsonableInstance;
  if (maybeReplacer.jsonReplacer === undefined) {
    return Generic_toJSON(ctorName, value as Record<string, unknown>, ctor.includedKeys);
  }
  return maybeReplacer.jsonReplacer();
}
