import { PositiveInteger } from "../types";
import { Corporation } from "./Corporation";
import { CorpUpgrade } from "./data/CorporationUpgrades";

export function calculateUpgradeCost(corporation: Corporation, upgrade: CorpUpgrade, amount: PositiveInteger): number {
  const priceMult = upgrade.priceMult;
  const level = corporation.upgrades[upgrade.name].level;
  const baseCost = upgrade.basePrice * Math.pow(priceMult, level);
  const cost = (baseCost * (1 - Math.pow(priceMult, amount))) / (1 - priceMult);
  return cost;
}

// There ought to be a more clever mathematical solution for this
export function calculateMaxAffordableUpgrade(
  corp: Corporation,
  upgrade: CorpUpgrade,
  amount: PositiveInteger | "MAX",
): 0 | PositiveInteger {
  if (amount !== "MAX" && calculateUpgradeCost(corp, upgrade, amount) < corp.funds) return amount;
  if (calculateUpgradeCost(corp, upgrade, 1 as PositiveInteger) > corp.funds) return 0;
  // We can definitely afford 1 of the upgrade
  let n = 1;
  // Multiply by 2 until we can't afford it anymore
  while (calculateUpgradeCost(corp, upgrade, (n * 2) as PositiveInteger) <= corp.funds) n *= 2;
  let tooHigh = n * 2;
  while (tooHigh - n > 1) {
    const nextCheck = (Math.ceil((tooHigh - n) / 2) + n) as PositiveInteger;
    if (calculateUpgradeCost(corp, upgrade, nextCheck) <= corp.funds) n = nextCheck;
    else tooHigh = nextCheck;
  }
  return n as PositiveInteger;
}
