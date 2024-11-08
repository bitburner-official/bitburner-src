import type { IReviverArrayValue } from "../utils/JSONReviver";
// Versions of js builtin classes that can be converted to and from JSON for use in save files

export class JSONSet<T> extends Set<T> {
  toJSON(): IReviverArrayValue {
    return { ctor: "JSONSet", data: Array.from(this) };
  }
  static fromJSON(value: IReviverArrayValue): JSONSet<any> {
    return new JSONSet(value.data);
  }
}

export class JSONMap<K, __V> extends Map<K, __V> {
  toJSON(): IReviverArrayValue {
    return { ctor: "JSONMap", data: Array.from(this) };
  }

  static fromJSON(value: IReviverArrayValue): JSONMap<any, any> {
    return new JSONMap(value.data);
  }
}
