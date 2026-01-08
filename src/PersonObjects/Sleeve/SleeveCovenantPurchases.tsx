/**
 * Implements the purchasing of extra Duplicate Sleeves from The Covenant,
 * as well as the purchasing of upgrades (memory)
 */

export const MaxSleevesFromCovenant = 5;
export const BaseCostPerSleeve = 10e12;
export function purchaseCost(n: number): number {
  const sleevesFromCovenant = n;
  return Math.pow(10, sleevesFromCovenant) * BaseCostPerSleeve;
}
