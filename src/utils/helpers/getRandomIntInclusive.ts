/**
 *
 * Gets a random integer between min (inclusive) and max (inclusive).
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *
 * @param min The minimum value in the range.
 * @param max The maximum value in the range.
 */
export function getRandomIntInclusive(min: number, max: number): number {
  if (min > max) {
    throw new Error(`Min is greater than max. Min: ${min}. Max: ${max}.`);
  }
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}
