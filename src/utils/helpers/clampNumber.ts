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

/**
 * Applies a soft cap to a value
 * Each additional chunk past softCap is `ratio` as effective as the previous chunk
 *
 * @param value - the value to apply the soft cap to
 * @param ratio - How much less effective each chunk is after the soft cap
 * @param chunk - The size of each chunk to diminish
 * @param softCap - The value at which the soft cap starts to take effect
 */
export function applySoftCap(
  value: number,
  ratio: number,
  chunk: number ,
  softCap: number ,
): number {
  const sign = Math.sign(value);
  const magnitude = Math.abs(value);

  if (magnitude <= softCap) {
    return value;
  }
  const excess = magnitude - softCap;

  const diminishedExcess = (ratio * chunk * (1 - Math.pow(ratio, excess / chunk))) / (1 - ratio);
 return (softCap + diminishedExcess) * sign;
}