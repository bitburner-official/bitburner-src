import { Player } from "@player";
import { PositiveInteger, isPositiveInteger } from "../types";
import { formatShares } from "../ui/formatNumber";
import { Corporation } from "./Corporation";
import { CorpUpgrade } from "./data/CorporationUpgrades";

export function calculateUpgradeCost(corporation: Corporation, upgrade: CorpUpgrade, amount: PositiveInteger): number {
  const priceMult = upgrade.priceMult;
  const level = corporation.upgrades[upgrade.name].level;
  const baseCost = upgrade.basePrice * Math.pow(priceMult, level);
  const cost = (baseCost * (1 - Math.pow(priceMult, amount))) / (1 - priceMult);
  return cost;
}

export function calculateMaxAffordableUpgrade(corp: Corporation, upgrade: CorpUpgrade): 0 | PositiveInteger {
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
  const maxAffordableUpgrades = Math.floor(
    Math.log(1 - (corp.funds / Base / Math.pow(Multi, Lvl)) * (1 - Multi)) / Math.log(Multi),
  );

  const sanitizedValue = maxAffordableUpgrades >= 0 ? maxAffordableUpgrades : 0;
  return sanitizedValue as PositiveInteger | 0;
}

/** Returns a string representing the reason a share buyback should fail, or empty string if there is no issue. */
export function buybackSharesFailureReason(corp: Corporation, numShares: number): string {
  if (!isPositiveInteger(numShares)) return "Number of shares must be a positive integer.";
  if (numShares > corp.issuedShares) return "Not enough shares are available for buyback.";
  if (numShares > 1e14) return `Cannot buy more than ${formatShares(1e14)} shares at a time.`;
  if (!corp.public) return "Cannot buy back shares before going public.";

  const [cost] = corp.calculateShareBuyback(numShares);
  if (Player.money < cost) return "You cannot afford that many shares.";

  return "";
}
