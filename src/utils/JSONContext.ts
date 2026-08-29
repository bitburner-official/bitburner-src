// This file is split out because of circular dependency issues between
// JSONMap and JSONReviver.

// Unlike on the reviving side, toJSON() has no direct way to pass context
// information to it, and using a replacer has speed implications. Instead, we
// set this global context before serialization starts and unset it after.
// (Unsetting is not strictly required, but saves memory and exposes any
// incorrect uses afterwards.)
let JSONContext: undefined | Map<string, number>;

export function setJSONContext(context: undefined | Map<string, number>) {
  JSONContext = context;
}

export const stringDataIdx = (key: string) => {
  // Once it has more adoption, this can use getOrInsert().
  if (JSONContext === undefined) {
    throw new Error("Tried to serialize game objects outside of save()");
  }
  let idx = JSONContext.get(key);
  if (idx === undefined) {
    idx = JSONContext.size;
    JSONContext.set(key, idx);
  }
  // We explicitly lie about the type here, because this exists to shove
  // numbers into fields that are typed for strings.
  return idx as unknown as string;
};
