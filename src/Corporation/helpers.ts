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

export function calculateMaxAffordableUpgrade(
  corp: Corporation,
  upgrade: CorpUpgrade,
  amount: PositiveInteger | "MAX",
): 0 | PositiveInteger {
  const Lvl = corp.upgrades[upgrade.name].level;
  const Multi = upgrade.priceMult;
  const Base = upgrade.basePrice;
  /*
    Let's calculate X - affordable upgrade count using the formula in `calculateUpgradeCost`:

    Base * Multi^Lvl * (1 - Multi^X) / (1 - Multi) <= FUNDS
    (1 - Multi^X) >= FUNDS / Base / Multi^Lvl * (1 - Multi)
    Multi^X >= 1 - FUNDS / Base / Multi^Lvl * (1 - Multi)
    X <= ln(1 - FUNDS / Base / Multi^Lvl * (1 - Multi)) / ln(Multi)
  */
  const max = Math.floor(Math.log(1 - (corp.funds / Base / Math.pow(Multi, Lvl)) * (1 - Multi)) / Math.log(Multi));
  const wanted = amount === "MAX" ? max : amount;
  return Math.min(max, wanted) as PositiveInteger | 0;
}
