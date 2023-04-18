import type { IReviverValue } from "../utils/JSONReviver";
// Jsonable versions of builtin JS class objects
export class JSONSet<T> extends Set<T> {
  toJSON(): IReviverValue {
    return { ctor: "JSONSet", data: Array.from(this) };
  }
  static fromJSON(value: IReviverValue): JSONSet<any> {
    return new JSONSet(value.data);
  }
}

export class JSONMap<K, V> extends Map<K, V> {
  toJSON(): IReviverValue {
    return { ctor: "JSONMap", data: Array.from(this) };
  }

  static fromJSON(value: IReviverValue): JSONMap<any, any> {
    return new JSONMap(value.data);
  }
}
