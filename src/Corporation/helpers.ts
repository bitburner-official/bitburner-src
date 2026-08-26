import { Player } from "@player";
import { CreatingCorporationCheckResult } from "@nsdefs";
import { PositiveInteger, isPositiveInteger } from "../types";
import { formatShares } from "../ui/formatNumber";
import { Corporation } from "./Corporation";
import { CorpUpgrade } from "./data/CorporationUpgrades";
import * as corpConstants from "./data/Constants";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { CreatingCorporationCheckResultEnum } from "@enums";
import { throwIfReachable } from "../utils/helpers/throwIfReachable";
import { Parser } from "expr-eval-fork";

// Configure a restricted parser by disabling unnecessary features.
const corpFormulaParser = new Parser({
  // Disallow access to object properties (e.g. obj.prop).
  allowMemberAccess: false,
  operators: {
    power: false,
    remainder: false,
    factorial: false,
    comparison: false,
    logical: false,
    conditional: false,
    concatenate: false,
    assignment: false,
    fndef: false,
    in: false,
  },
});
// Restrict the parser to a minimal feature set by overriding the built-in unary operators, functions, and constants.
corpFormulaParser.unaryOps = {
  "-": (value: number) => -value,
  "+": Number,
};
corpFormulaParser.functions = {};
corpFormulaParser.consts = {};

export function evaluateCorpFormula(formula: string, variables: Readonly<Record<string, number>>): number {
  const result = corpFormulaParser.evaluate(formula, variables);
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("公式的计算结果不是有限数。");
  }
  return result;
}

export function convertCreatingCorporationCheckResultToMessage(checkResult: CreatingCorporationCheckResult): string {
  switch (checkResult) {
    case CreatingCorporationCheckResultEnum.Success:
      return "Success";
    case CreatingCorporationCheckResultEnum.NoSf3OrDisabled:
      return "你没有 SF3，或者企业已被高级选项禁用";
    case CreatingCorporationCheckResultEnum.CorporationExists:
      return "企业已存在";
    case CreatingCorporationCheckResultEnum.UseSeedMoneyOutsideBN3:
      return "不能在 BitNode 3 之外使用种子资金";
    case CreatingCorporationCheckResultEnum.DisabledBySoftCap:
      return "无法在这个 BitNode 中创建企业";
    default:
      throwIfReachable(checkResult);
  }
  return String(checkResult);
}

export function canCreateCorporation(selfFund: boolean, restart: boolean): CreatingCorporationCheckResult {
  if (!Player.canAccessCorporation()) {
    return CreatingCorporationCheckResultEnum.NoSf3OrDisabled;
  }
  if (Player.corporation && !restart) {
    return CreatingCorporationCheckResultEnum.CorporationExists;
  }
  if (Player.bitNodeN !== 3 && !selfFund) {
    return CreatingCorporationCheckResultEnum.UseSeedMoneyOutsideBN3;
  }
  if (currentNodeMults.CorporationSoftcap < 0.15) {
    return CreatingCorporationCheckResultEnum.DisabledBySoftCap;
  }
  return CreatingCorporationCheckResultEnum.Success;
}

export function costOfCreatingCorporation(restart: boolean): number {
  if (restart && !Player.corporation?.seedFunded) {
    return 50e9;
  }
  return 150e9;
}

export function calculateUpgradeCost(
  basePrice: number,
  priceMult: number,
  fromLevel: number,
  amount: PositiveInteger,
): number {
  const baseCost = basePrice * Math.pow(priceMult, fromLevel);
  const cost = (baseCost * (1 - Math.pow(priceMult, amount))) / (1 - priceMult);
  return cost;
}

export function calculateOfficeSizeUpgradeCost(currentSize: number, sizeIncrease: PositiveInteger): number {
  if (sizeIncrease <= 0) throw new Error("Invalid value for sizeIncrease argument! Must be at least 0!");
  const baseCostDivisor = 0.09;
  const baseCostMultiplier = 1 + baseCostDivisor;
  const currentSizeFactor = baseCostMultiplier ** (currentSize / 3);
  const sizeIncreaseFactor = baseCostMultiplier ** (sizeIncrease / 3) - 1;
  return (corpConstants.officeInitialCost / baseCostDivisor) * currentSizeFactor * sizeIncreaseFactor;
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

/** Returns a string representing the reason a share sale should fail, or empty string if there is no issue. */
export function sellSharesFailureReason(corp: Corporation, numShares: number): string {
  if (!isPositiveInteger(numShares)) return "股份数必须是正整数。";
  else if (numShares > corp.numShares) return "你没有那么多股份可以出售。";
  else if (numShares === corp.numShares) return "你不能出售自己的全部股份。";
  else if (numShares > 1e14) return `单次最多只能出售 ${formatShares(1e14)} 股。`;
  else if (!corp.public) return "上市之前无法出售股份。";
  else if (corp.shareSaleCooldown)
    return `无法出售股份，还需等待 ${corp.convertCooldownToString(corp.shareSaleCooldown)}。`;
  return "";
}

/** Returns a string representing the reason a share buyback should fail, or empty string if there is no issue. */
export function buybackSharesFailureReason(corp: Corporation, numShares: number): string {
  if (!isPositiveInteger(numShares)) return "股份数必须是正整数。";
  if (numShares > corp.issuedShares) return "没有足够的股份可供回购。";
  if (numShares > 1e14) return `单次最多只能购买 ${formatShares(1e14)} 股。`;
  if (!corp.public) return "上市之前无法回购股份。";

  const [cost] = corp.calculateShareBuyback(numShares);
  if (Player.money < cost) return "你买不起那么多股份。";

  return "";
}

/** Returns a string representing the reason issuing new shares should fail, or empty string if there is no issue. */
export function issueNewSharesFailureReason(corp: Corporation, numShares: number): string {
  if (!isPositiveInteger(numShares)) return "股份数必须是正整数。";
  if (numShares % 10e6 !== 0) return "股份数必须是1000万的整数倍。";
  if (!corp.public) return "上市之前无法发行新股。";

  const maxNewShares = corp.calculateMaxNewShares();
  if (numShares > maxNewShares) return `新股数量不能超过 ${maxNewShares}（占总股份的20%）。`;

  const cooldown = corp.issueNewSharesCooldown;
  if (cooldown > 0) return `无法发行新股，还需等待 ${corp.convertCooldownToString(cooldown)}。`;

  return "";
}

export function calculateMarkupMultiplier(sellingPrice: number, marketPrice: number, markupLimit: number): number {
  // Sanitize sellingPrice
  if (!Number.isFinite(sellingPrice)) {
    return 1;
  }
  let markupMultiplier = 1;
  if (sellingPrice > marketPrice) {
    // markupMultiplier is a penalty modifier if sellingPrice is greater than the sum of marketPrice and markupLimit.
    if (sellingPrice > marketPrice + markupLimit) {
      markupMultiplier = Math.pow(markupLimit / (sellingPrice - marketPrice), 2);
    }
  } else {
    if (sellingPrice <= 0) {
      // Discard
      markupMultiplier = 1e12;
    } else {
      // markupMultiplier is a bonus modifier if sellingPrice is less than marketPrice.
      markupMultiplier = marketPrice / sellingPrice;
    }
  }
  return markupMultiplier;
}
