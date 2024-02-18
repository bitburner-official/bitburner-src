/**
 * Clamps the value on a lower and an upper bound
 * @param {number} value Value to clamp
 * @param {number} min Lower bound
 * @param {number} max Upper bound
 * @returns {number} Clamped value
 */
export function clampNumber(value: number, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
  if (isNaN(value)) throw new Error("NaN passed into clampNumber()");
  return Math.max(Math.min(value, max), min);
}
