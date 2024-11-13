import { getFriendlyType, throwErrorIfNotArray } from "../utils/helpers/typeAssertion";
import type { IReviverValue } from "../utils/JSONReviver";
// Versions of js builtin classes that can be converted to and from JSON for use in save files

export class JSONSet<T> extends Set<T> {
  toJSON(): IReviverValue {
    return { ctor: "JSONSet", data: Array.from(this) };
  }
  static fromJSON(value: IReviverValue): JSONSet<any> {
    throwErrorIfNotArray(value.data);
    return new JSONSet(value.data);
  }
}

export class JSONMap<K, __V> extends Map<K, __V> {
  toJSON(): IReviverValue {
    return { ctor: "JSONMap", data: Array.from(this) };
  }

  static fromJSON(value: IReviverValue): JSONMap<any, any> {
    throwErrorIfNotArray(value.data);
    for (const item of value.data) {
      if (!Array.isArray(item)) {
        throw new Error(`An item in the array is not an array. Its type is ${getFriendlyType(value.data)}.`);
      }
      if (item.length !== 2) {
        throw new Error(`An item is not an array with exactly 2 items. Its length is ${item.length}.`);
      }
    }
    // We validated the data above, so it's safe to typecast here.
    return new JSONMap(value.data as [unknown, unknown][]);
  }
}
