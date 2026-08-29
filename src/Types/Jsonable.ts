import { assertArray, assertFiniteNumber } from "../utils/TypeAssertion";
import { stringDataIdx } from "../utils/JSONContext";
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
    let index = false;
    const data = [];
    for (const [k, v] of this) {
      // This makes a critical assumption that the keys are homogeneous. If
      // the key type is a union of string and number, this will produce invalid data.
      if (typeof k === "string") {
        index = true;
        data.push([stringDataIdx(k), v]);
      } else {
        data.push([k, v]);
      }
    }
    return index ? { ctor: "JSONMap", index, data } : { ctor: "JSONMap", data };
  }

  static fromJSON(value: IReviverValue, context?: string[]): JSONMap<any, any> {
    context ??= [];
    assertArray(value.data);
    for (const item of value.data) {
      assertArray(item);
      if (item.length !== 2) {
        console.error("Invalid data passed to JSONMap.fromJSON(). Value:", value);
        throw new Error(`An item is not an array with exactly 2 items. Its length is ${item.length}.`);
      }
      if (value.index) {
        assertFiniteNumber(item[0]);
        item[0] = context[item[0]];
      }
    }
    // We validated the data above, so it's safe to typecast here.
    return new JSONMap(value.data as [unknown, unknown][]);
  }
}
