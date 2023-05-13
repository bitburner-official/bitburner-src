import type { IReviverValue } from "../utils/JSONReviver";
// Versions of js builtin classes that can be converted to and from JSON for use in save files

export class JSONSet<T> extends Set<T> {
  toJSON(): IReviverValue {
    return { ctor: "JSONSet", data: Array.from(this) };
  }
  static fromJSON(value: IReviverValue): JSONSet<any> {
    return new JSONSet(value.data);
  }
}

export class JSONMap<K, __V> extends Map<K, __V> {
  toJSON(): IReviverValue {
    return { ctor: "JSONMap", data: Array.from(this) };
  }

  static fromJSON(value: IReviverValue): JSONMap<any, any> {
    return new JSONMap(value.data);
  }
}
