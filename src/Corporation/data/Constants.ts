import {
  CorpEmployeePosition,
  CorpIndustryName,
  CorpMaterialName as APIMaterialName,
  CorpResearchName,
  CorpSmartSupplyOption,
  CorpStateName,
  CorpUnlockName as APIUnlockName,
  CorpUpgradeName as APIUpgradeName,
} from "@nsdefs";
import { CONSTANTS } from "../../Constants";
import {
  IndustryType,
  CorpEmployeeJob,
  CorpMaterialName,
  CorpUnlockName,
  CorpUpgradeName,
  SmartSupplyOption,
  CorpBaseResearchName,
  CorpProductResearchName,
} from "@enums";
import { PositiveInteger } from "../../types";

/** Names of all corporation game states */
export const stateNames: CorpStateName[] = ["START", "PURCHASE", "PRODUCTION", "EXPORT", "SALE"],
  // TODO: remove IndustryType and EmployeePositions enums and just use the typed strings.
  /** Names of all corporation employee positions */
  employeePositions: CorpEmployeePosition[] = Object.values(CorpEmployeeJob),
  /** Names of all industries. */
  industryNames: CorpIndustryName[] = Object.values(IndustryType),
  /** Names of all materials */
  materialNames: APIMaterialName[] = Object.values(CorpMaterialName),
  /** Names of all one-time corporation-wide unlocks */
  unlockNames: APIUnlockName[] = Object.values(CorpUnlockName),
  upgradeNames: APIUpgradeName[] = Object.values(CorpUpgradeName),
  /** Names of all researches common to all industries */
  researchNamesBase: CorpResearchName[] = Object.values(CorpBaseResearchName),
  /** Names of all researches only available to product industries */
  researchNamesProductOnly: CorpResearchName[] = Object.values(CorpProductResearchName),
  /** Names of all researches */
  researchNames: CorpResearchName[] = [...researchNamesBase, ...researchNamesProductOnly],
  initialShares = 1e9,
  /** When selling large number of shares, price is dynamically updated for every batch of this amount */
  sharesPerPriceUpdate = 1e6,
  /** Cooldown for issue new shares cooldown in game cycles. Initially 4 hours. */
  issueNewSharesCooldown = 72e3,
  /** Cooldown for selling shares in game cycles. 1 hour. */
  sellSharesCooldown = 18e3,
  teaCostPerEmployee = 500e3,
  gameCyclesPerMarketCycle = 50,
  gameCyclesPerCorpStateCycle = gameCyclesPerMarketCycle / stateNames.length,
  secondsPerMarketCycle = (gameCyclesPerMarketCycle * CONSTANTS.MilliPerCycle) / 1000,
  warehouseInitialCost = 5e9,
  warehouseInitialSize = 100,
  warehouseSizeUpgradeCostBase = 1e9,
  officeInitialCost = 4e9,
  officeInitialSize = 3,
  officeSizeUpgradeCostBase = 1e9,
  bribeThreshold = 100e12,
  bribeAmountPerReputation = 1e9,
  baseProductProfitMult = 5,
  dividendMaxRate = 1,
  /** Conversion factor for employee stats to initial salary */
  employeeSalaryMultiplier = 3,
  marketCyclesPerEmployeeRaise = 400,
  employeeRaiseAmount = 50,
  /** Max products for a division without upgrades */
  maxProductsBase = 3,
  fundingRoundShares = [0.1, 0.35, 0.25, 0.2],
  fundingRoundMultiplier = [3, 2, 2, 1.5],
  valuationLength = 10,
  /** Minimum decay value for employee morale/energy */
  minEmployeeDecay = 10,
  /** smart supply options */
  smartSupplyOptions: CorpSmartSupplyOption[] = Object.values(SmartSupplyOption),
  PurchaseMultipliers = {
    x1: 1 as PositiveInteger,
    x5: 5 as PositiveInteger,
    x10: 10 as PositiveInteger,
    x50: 50 as PositiveInteger,
    x100: 100 as PositiveInteger,
    MAX: "MAX" as const,
  };
