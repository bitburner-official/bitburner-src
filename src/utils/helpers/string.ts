/** Removes a single layer of matching single or double quotes, if present. */
export function trimQuotes(value: string): string {
  if (value.length < 2) return value;
  if (value.at(0) !== value.at(-1)) return value;
  if (value.at(0) !== "'" && value.at(0) !== '"') return value;
  return value.substring(1, value.length - 1);
}
