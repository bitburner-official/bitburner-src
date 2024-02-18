import { CONSTANTS } from "../../Constants";
/**
 * Clamps the value on a lower and an upper bound
 * @param {number} value Value to clamp
 * @param {number} min Lower bound, defaults to Number.MIN_VALUE
 * @param {number} max Upper bound, defaults to Number.MAX_VALUE
 * @returns {number} Clamped value
 */
export function clampNumber(value: number, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
  if (isNaN(value)) {
    if (CONSTANTS.isDevBranch) throw new Error("NaN passed into clampNumber()");
    return min;
  }
  return Math.max(Math.min(value, max), min);
}
