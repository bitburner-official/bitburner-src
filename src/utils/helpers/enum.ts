import { getRandomInt } from "./getRandomInt";

interface EnumHelper<T> {
  has(value: unknown): value is T;
  find(value: string): T | undefined;
  random(): T;
  [Symbol.iterator](): Iterator<T>;
}

function findStringItem<T>(value: string, iterable: Iterable<T>) {
  const lowerValue = value.toLowerCase().replace(/ /g, "");
  for (const member of iterable) {
    if (typeof member === "string") {
      if (lowerValue.includes(member.toLowerCase().replace(/ /g, ""))) {
        return member;
      }
    }
  }
}

class ObjectEnum<T extends object, K extends T[keyof T]> implements EnumHelper<K> {
  readonly #reverse: Map<K, string>;

  constructor(baseObject: T) {
    this.#reverse = new Map(Object.entries(baseObject).map(([key, value]) => [value, key.toString()] as const));
  }

  has(value: unknown): value is K {
    return this.#reverse.has(value as any);
  }

  find(value: string): K | undefined {
    return findStringItem(value, this.#reverse.keys());
  }

  getKey(value: K) {
    return this.#reverse.get(value);
  }

  random() {
    const items = [...this.#reverse.keys()];
    const index = getRandomInt(0, items.length - 1);
    return items[index];
  }

  [Symbol.iterator]() {
    return this.#reverse.keys();
  }
}

export function buildObjectEnum<T extends object, K extends T[keyof T]>(
  baseObject: T,
): ObjectEnum<T, K> & { [Name in keyof T]: T[Name] } {
  const instance = new ObjectEnum<T, K>(baseObject);
  for (const [name, key] of Object.entries(baseObject)) {
    Object.defineProperty(instance, name, { get: () => key });
  }
  return instance as ObjectEnum<T, K> & { [Name in keyof T]: T[Name] };
}

export class ListEnum<T> implements EnumHelper<T> {
  readonly #list: readonly T[];
  readonly #items: Set<T>;

  get list() {
    return this.#list;
  }

  constructor(list: readonly T[] | T[]) {
    this.#list = Object.freeze(list);
    this.#items = new Set(list);
  }

  has(value: unknown): value is T {
    return this.#items.has(value as any);
  }

  find(value: string) {
    return findStringItem(value, this.#items);
  }

  random() {
    const index = getRandomInt(0, this.#list.length - 1);
    return this.#list[index];
  }

  [Symbol.iterator](): Iterator<T> {
    return this.#items.values();
  }
}
