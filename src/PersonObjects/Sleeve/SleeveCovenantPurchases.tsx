import { Player } from "@player";
import type { Result } from "@nsdefs";
import { Sleeve } from "./Sleeve";
import { Factions } from "../../Faction/Factions";
import { FactionName } from "@enums";
import { formatMoney } from "../../ui/formatNumber";

/**
 * Implements the purchasing of extra Duplicate Sleeves from The Covenant,
 * as well as the purchasing of upgrades (memory)
 */

export const MaxSleevesFromCovenant = 5;
export const BaseCostPerSleeve = 10e12;

export function getSleeveCost(sleevesFromCovenant: number): number {
  // The first two checks are a bit over-the-top, but they are useful if we allow passing an arbitrary value to this
  // function instead of only Player.sleevesFromCovenant.
  if (
    !Number.isInteger(sleevesFromCovenant) ||
    sleevesFromCovenant < 0 ||
    sleevesFromCovenant >= MaxSleevesFromCovenant
  ) {
    return Infinity;
  }
  return Math.pow(10, sleevesFromCovenant) * BaseCostPerSleeve;
}

export function canPurchaseSleeve(): Result {
  if (Player.bitNodeN !== 10) {
    return {
      success: false,
      message: "You must be in BitNode 10 to purchase sleeves.",
    };
  }
  if (!Factions[FactionName.TheCovenant].isMember) {
    return {
      success: false,
      message: `You must be a member of ${FactionName.TheCovenant} to purchase sleeves.`,
    };
  }
  if (Player.sleevesFromCovenant >= MaxSleevesFromCovenant) {
    return {
      success: false,
      message: `You already have the maximum amount of sleeves purchasable from ${FactionName.TheCovenant}.`,
    };
  }
  const cost = getSleeveCost(Player.sleevesFromCovenant);
  if (!Player.canAfford(cost)) {
    return {
      success: false,
      message: `You must have at least ${formatMoney(cost)} to buy this sleeve.`,
    };
  }
  return { success: true };
}

export function recalculateNumberOfOwnedSleeves(): void {
  // Don't change sourceFileLvl to activeSourceFileLvl. The number of sleeves is a permanent effect. It's too
  // troublesome for the player if they lose Sleeves and have to go BN10 to buy them again when they override the
  // level of SF 10.
  const numSleeves =
    Math.min(3, Player.sourceFileLvl(10) + (Player.bitNodeN === 10 ? 1 : 0)) + Player.sleevesFromCovenant;
  while (Player.sleeves.length > numSleeves) {
    const destroyedSleeve = Player.sleeves.pop();
    // This should not happen, but avoid an infinite loop in case Player.sleevesFromCovenant or sf10 level are somehow
    // negative
    if (!destroyedSleeve) return;
    // Stop work, to prevent destroyed sleeves from continuing their tasks in the void
    destroyedSleeve.stopWork();
  }
  while (Player.sleeves.length < numSleeves) Player.sleeves.push(new Sleeve());
}

export function purchaseSleeve(): Result {
  const validationResult = canPurchaseSleeve();
  if (!validationResult.success) {
    return validationResult;
  }
  Player.loseMoney(getSleeveCost(Player.sleevesFromCovenant), "sleeves");
  Player.sleevesFromCovenant += 1;
  recalculateNumberOfOwnedSleeves();
  return { success: true };
}

export function canPurchaseMemoryUpgrade(sleeve: Sleeve, amount: number): Result {
  if (Player.bitNodeN !== 10) {
    return {
      success: false,
      message: "You must be in BitNode 10 to purchase sleeves' memory upgrade.",
    };
  }
  if (!Factions[FactionName.TheCovenant].isMember) {
    return {
      success: false,
      message: `You must be a member of ${FactionName.TheCovenant} to purchase sleeves' memory upgrade.`,
    };
  }
  if (sleeve.memory + amount > 100) {
    return {
      success: false,
      message: `Invalid amount of upgrade: ${amount}. The max memory of a sleeve is 100.`,
    };
  }
  const cost = sleeve.getMemoryUpgradeCost(amount);
  if (!Player.canAfford(cost)) {
    return {
      success: false,
      message: `You must have at least ${formatMoney(cost)} to buy this sleeve's memory upgrade.`,
    };
  }
  return { success: true };
}

export function purchaseSleeveMemoryUpgrade(sleeve: Sleeve, amount: number): Result {
  const validationResult = canPurchaseMemoryUpgrade(sleeve, amount);
  if (!validationResult.success) {
    return validationResult;
  }
  Player.loseMoney(sleeve.getMemoryUpgradeCost(amount), "sleeves");
  sleeve.upgradeMemory(amount);
  return { success: true };
}
