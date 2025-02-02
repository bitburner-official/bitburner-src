import { assertArray } from "../utils/TypeAssertion";
import type { IReviverValue } from "../utils/JSONReviver";
// Versions of js builtin classes that can be converted to and from JSON for use in save files

export class JSONSet<T> extends Set<T> {
  toJSON(): IReviverValue {
    return { ctor: "JSONSet", data: Array.from(this) };
  }
  static fromJSON(value: IReviverValue): JSONSet<any> {
    assertArray(value.data);
    return new JSONSet(value.data);
  }
}

export class JSONMap<K, __V> extends Map<K, __V> {
  toJSON(): IReviverValue {
    return { ctor: "JSONMap", data: Array.from(this) };
  }

  static fromJSON(value: IReviverValue): JSONMap<any, any> {
    assertArray(value.data);
    for (const item of value.data) {
      assertArray(item);
      if (item.length !== 2) {
        console.error("Invalid data passed to JSONMap.fromJSON(). Value:", value);
        throw new Error(`An item is not an array with exactly 2 items. Its length is ${item.length}.`);
      }
    }
    // We validated the data above, so it's safe to typecast here.
    return new JSONMap(value.data as [unknown, unknown][]);
  }
}
