/**
 * Rounds a number to two decimal places.
 * @param decimal A decimal value to trim to two places.
 */
export function roundToTwo(decimal: number): number {
  return roundToN(decimal, 2);
}

/**
 * Rounds a number to n decimal places.
 * @param decimal A decimal value to trim to n places.
 * @param digits the number of digits to trim to.
 */
export function roundToN(decimal: number, digits: number): number {
  const roundingFactor = 10 ** digits;
  return Math.round(decimal * roundingFactor) / roundingFactor;
}
