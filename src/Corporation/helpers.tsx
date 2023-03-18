import { Corporation } from "./Corporation";
import { CorporationUpgrade } from "./data/CorporationUpgrades";

export function calculateUpgradeCost(corporation: Corporation, upgrade: CorporationUpgrade, amount: number): number {
  if (amount < 1) return 0;
  const priceMult = upgrade.priceMult;
  const level = corporation.upgrades[upgrade.index];
  const baseCost = upgrade.basePrice * Math.pow(priceMult, level);
  const cost = (baseCost * (1 - Math.pow(priceMult, amount))) / (1 - priceMult);
  return cost;
}

export function calculateMaxAffordableUpgrade(
  corporation: Corporation,
  upgrade: CorporationUpgrade,
  amount: number | "MAX",
): number {
  if (amount != "MAX") {
    if (amount === 0) return 0;
    if (calculateUpgradeCost(corporation, upgrade, amount) < corporation.funds) return amount;
  }

  let n = 1;
  while (
    calculateUpgradeCost(corporation, upgrade, n * 2) < corporation.funds &&
    (amount != "MAX" ? n < amount : true)
  ) {
    n *= 2;
  }
  for (let i = n / 2; i >= 1; i /= 2) {
    if (calculateUpgradeCost(corporation, upgrade, n + i) < corporation.funds) n += i;
  }

  return amount === "MAX" ? n : Math.min(n, amount);
}
