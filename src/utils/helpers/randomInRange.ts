// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_two_values
export function randomInRange(min: number, max: number): number {
  if (min > max) {
    throw new Error(`Min is greater than max. Min: ${min}. Max: ${max}.`);
  }
  return Math.random() * (max - min) + min;
}
