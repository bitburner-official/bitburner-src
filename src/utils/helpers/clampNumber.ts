import { CONSTANTS } from "../../Constants";
/**
 * Clamps the value on a lower and an upper bound
 * @param {number} value Value to clamp
 * @param {number} min Lower bound, defaults to negative Number.MAX_VALUE
 * @param {number} max Upper bound, defaults to Number.MAX_VALUE
 * @returns {number} Clamped value
 */
export function clampNumber(value: number, min = -Number.MAX_VALUE, max = Number.MAX_VALUE) {
  if (isNaN(value)) {
    if (CONSTANTS.isDevBranch) throw new Error("NaN passed into clampNumber()");
    return min;
  }
  return Math.max(Math.min(value, max), min);
}

export function clampInteger(value: number, min = -Number.MAX_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  if (isNaN(value)) {
    if (CONSTANTS.isDevBranch) throw new Error("NaN passed into clampInteger()");
    return min;
  }
  return Math.round(Math.max(Math.min(value, max), min));
}
