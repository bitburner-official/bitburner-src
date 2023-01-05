import { getRandomInt } from "./getRandomInt";

class BaseEnum<T extends object, K extends T[keyof T]> {
  readonly #items: Set<K>;
  readonly #reverse: Map<K, string>;

  constructor(baseObject: T) {
    this.#items = new Set(Object.values(baseObject));
    this.#reverse = new Map(Object.entries(baseObject).map(([key, value]) => [value, key.toString()] as const));
  }

  has(value: unknown): value is K {
    return this.#items.has(value as any);
  }

  find(value: string): K | undefined {
    const lowerValue = value.toLowerCase().replace(/ /g, "");
    for (const member of this.#items) {
      if (typeof member === "string") {
        if (lowerValue.includes(member.toLowerCase().replace(/ /g, ""))) {
          return member;
        }
      }
    }
  }

  getKey(value: K) {
    return this.#reverse.get(value);
  }

  random() {
    const items = [...this.#items];
    const index = getRandomInt(0, items.length - 1);
    return items[index];
  }

  [Symbol.iterator]() {
    return this.#items[Symbol.iterator]();
  }
}

export function buildEnum<T extends object, K extends T[keyof T]>(
  baseObject: T,
): BaseEnum<T, K> & { [Name in keyof T]: T[Name] } {
  const instance = new BaseEnum<T, K>(baseObject);
  for (const [name, key] of Object.entries(baseObject)) {
    Object.defineProperty(instance, name, { get: () => key });
  }
  return instance as BaseEnum<T, K> & { [Name in keyof T]: T[Name] };
}
