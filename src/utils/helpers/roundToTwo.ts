/**
 * Rounds a number to two decimal places.
 * @param decimal A decimal value to trim to two places.
 */
export function roundToTwo(decimal: number): number {
  return Math.round(decimal * 100) / 100;
}
