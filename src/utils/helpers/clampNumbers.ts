/**
 * caps the value on a lower and an upper bound
 * @param {number} value value to cap
 * @param {number} min lower bound
 * @param {number} max upper bound
 * @returns {number} capped value
 */
function clampNumber(value: number, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
  return Math.max(Math.min(value, max), min);
}
export default clampNumber;
