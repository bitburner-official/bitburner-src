// We can probably get rid of isString in favor of just checking typeof value==="string".
// We are not and should not ever be using `new String()` for anything. Will remove in 2.3.1
/**
 * Checks whether the value passed in can be considered a string.
 * @param value The value to check if it is a string.
 */
export function isString(value: unknown): value is string {
  return typeof value === "string" || value instanceof String;
}

/** Removes a single layer of matching single or double quotes, if present. */
export function trimQuotes(value: string): string {
  if (value.length < 2) return value;
  if (value.at(0) !== value.at(-1)) return value;
  if (value.at(0) !== "'" && value.at(0) !== '"') return value;
  return value.substring(1, value.length - 1);
}
