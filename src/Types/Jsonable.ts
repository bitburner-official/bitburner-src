import type { IReviverValue } from "../utils/JSONReviver";

// Loosened type requirements on input for has, also has provides typecheck info.
export interface JSONSet<T> {
  has: (value: unknown) => value is T;
}
export class JSONSet<T> extends Set<T> {
  toJSON(): IReviverValue {
    return { ctor: "JSONSet", data: Array.from(this) };
  }
  static fromJSON(value: IReviverValue): JSONSet<any> {
    return new JSONSet(value.data);
  }
}

// Loosened type requirements on input for has. has also provides typecheck info.
export interface JSONMap<K, __V> {
  has: (key: unknown) => key is K;
}
export class JSONMap<K, __V> extends Map<K, __V> {
  toJSON(): IReviverValue {
    return { ctor: "JSONMap", data: Array.from(this) };
  }

  static fromJSON(value: IReviverValue): JSONMap<any, any> {
    return new JSONMap(value.data);
  }
}
