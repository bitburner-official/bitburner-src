import { Player } from "@player";
import type { CorpResearchName, CorpSmartSupplyOption, Result } from "@nsdefs";

import { MaterialInfo } from "./MaterialInfo";
import { Corporation } from "./Corporation";
import { IndustryResearchTrees, IndustriesData } from "./data/IndustryData";
import { Division } from "./Division";
import * as corpConstants from "./data/Constants";
import { OfficeSpace } from "./OfficeSpace";
import { Material } from "./Material";
import { Product } from "./Product";
import { Warehouse } from "./Warehouse";
import { CreatingCorporationCheckResultEnum, FactionName, IndustryType } from "@enums";
import { ResearchMap } from "./ResearchMap";
import { isRelevantMaterial } from "./ui/Helpers";
import { CityName } from "@enums";
import { getRandomIntInclusive } from "../utils/helpers/getRandomIntInclusive";
import { getRecordValues } from "../Types/Record";
import {
  calculateOfficeSizeUpgradeCost,
  sellSharesFailureReason,
  buybackSharesFailureReason,
  issueNewSharesFailureReason,
  costOfCreatingCorporation,
  canCreateCorporation,
  convertCreatingCorporationCheckResultToMessage,
  evaluateCorpFormula,
} from "./helpers";
import type { PositiveInteger } from "../types";
import { Factions } from "../Faction/Factions";
import { throwIfReachable } from "../utils/helpers/throwIfReachable";
import { formatMoney, formatNumber } from "../ui/formatNumber";

export function createCorporation(corporationName: string, selfFund: boolean, restart: boolean): Result {
  const checkResult = canCreateCorporation(selfFund, restart);
  switch (checkResult) {
    case CreatingCorporationCheckResultEnum.Success:
      break;
    case CreatingCorporationCheckResultEnum.NoSf3OrDisabled:
    case CreatingCorporationCheckResultEnum.CorporationExists:
      return { success: false, message: convertCreatingCorporationCheckResultToMessage(checkResult) };
    case CreatingCorporationCheckResultEnum.UseSeedMoneyOutsideBN3:
    case CreatingCorporationCheckResultEnum.DisabledBySoftCap:
      // In order to maintain backward compatibility, we have to throw an error in these cases.
      throw new Error(convertCreatingCorporationCheckResultToMessage(checkResult));
    default:
      throwIfReachable(checkResult);
  }

  if (!corporationName) {
    return { success: false, message: "企业名称不能为空字符串。" };
  }

  if (selfFund) {
    const cost = costOfCreatingCorporation(restart);
    if (!Player.canAfford(cost)) {
      return {
        success: false,
        message: `你的资金不足，无法创办企业。这需要花费 ${formatMoney(cost)}。`,
      };
    }
    Player.startCorporation(corporationName, false);
    Player.loseMoney(cost, "corporation");
  } else {
    Player.startCorporation(corporationName, true);
  }
  return { success: true };
}

export function createDivision(corporation: Corporation, industry: IndustryType, name: string): void {
  if (corporation.divisions.size >= corporation.maxDivisions)
    throw new Error(`无法扩张到 ${industry} 行业，部门数量已达上限！`);

  if (corporation.divisions.has(name)) throw new Error(`部门名称 ${name} 已被使用！`);
  // "Overview" is forbidden as a division name, see CorporationRoot.tsx for why this would cause issues.
  if (name === "Overview") throw new Error(`“Overview”是禁止使用的部门名称。`);

  const data = IndustriesData[industry];
  if (!data) throw new Error(`无效的行业：'${industry}'`);
  const cost = data.startingCost;
  if (corporation.funds < cost) {
    throw new Error("资金不足，无法在该行业创建新部门");
  } else if (name === "") {
    throw new Error("新部门必须有名称！");
  } else {
    corporation.loseFunds(cost, "division");
    corporation.divisions.set(
      name,
      new Division({
        corp: corporation,
        name: name,
        industry: industry,
      }),
    );
    corporation.numberOfOfficesAndWarehouses += 2;
  }
}

export function removeDivision(corporation: Corporation, name: string): number {
  const division = corporation.divisions.get(name);
  if (!division) throw new Error("没有名为 " + name + " 的部门");
  corporation.divisions.delete(name);
  corporation.numberOfOfficesAndWarehouses -= getRecordValues(division.offices).length;
  corporation.numberOfOfficesAndWarehouses -= getRecordValues(division.warehouses).length;

  // We also need to remove any exports that were pointing to the old division
  for (const otherDivision of corporation.divisions.values()) {
    for (const warehouse of getRecordValues(otherDivision.warehouses)) {
      for (const material of getRecordValues(warehouse.materials)) {
        // Work backwards through exports array so splicing doesn't affect the loop
        for (let i = material.exports.length - 1; i >= 0; i--) {
          if (material.exports[i].division === name) material.exports.splice(i, 1);
        }
      }
    }
  }
  const price = division.calculateRecoupableValue();
  corporation.gainFunds(price, "division");
  return price;
}

export function purchaseOffice(corporation: Corporation, division: Division, city: CityName): void {
  if (corporation.funds < corpConstants.officeInitialCost) {
    throw new Error("公司资金不足，无法开设新办事处！");
  }
  if (division.offices[city]) {
    throw new Error(`你已经为 ${division.name} 扩张到 ${city} 了`);
  }
  corporation.loseFunds(corpConstants.officeInitialCost, "division");
  division.offices[city] = new OfficeSpace({
    city: city,
    size: corpConstants.officeInitialSize,
  });
  ++corporation.numberOfOfficesAndWarehouses;
}

export function issueDividends(corporation: Corporation, rate: number): void {
  if (isNaN(rate) || rate < 0 || rate > corpConstants.dividendMaxRate) {
    throw new Error(`数值无效。必须是 0 到 ${corpConstants.dividendMaxRate} 之间的数字`);
  }

  corporation.dividendRate = rate;
}

export function goPublic(corporation: Corporation, numShares: number): void {
  const ceoOwnership = (corporation.numShares - numShares) / corporation.totalShares;
  const initialSharePrice = corporation.getTargetSharePrice(ceoOwnership);

  if (isNaN(numShares) || numShares < 0) {
    throw new Error("发行的股份数值无效");
  }
  if (numShares > corporation.numShares) {
    throw new Error("你没有那么多股份可供发行！");
  }
  corporation.public = true;
  corporation.sharePrice = initialSharePrice;
  corporation.issuedShares += numShares;
  corporation.numShares -= numShares;
  corporation.gainFunds(numShares * initialSharePrice, "public equity");
}

export function issueNewShares(
  corporation: Corporation,
  amount: number,
): [profit: number, amount: number, privateShares: number] {
  const failureReason = issueNewSharesFailureReason(corporation, amount);
  if (failureReason) throw new Error(failureReason);

  const ceoOwnership = corporation.numShares / (corporation.totalShares + amount);
  const newSharePrice = corporation.getTargetSharePrice(ceoOwnership);

  const profit = (amount * (corporation.sharePrice + newSharePrice)) / 2;

  const cooldownMultiplier = corporation.totalShares / corpConstants.initialShares;
  corporation.issueNewSharesCooldown = corpConstants.issueNewSharesCooldown * cooldownMultiplier;

  const privateOwnedRatio = corporation.investorShares / corporation.totalShares;
  const maxPrivateShares = Math.round((amount / 2) * privateOwnedRatio);
  const privateShares = Math.round(getRandomIntInclusive(0, maxPrivateShares) / 10e6) * 10e6;

  corporation.issuedShares += amount - privateShares;
  corporation.investorShares += privateShares;
  corporation.totalShares += amount;
  corporation.gainFunds(profit, "public equity");
  // Set sharePrice directly because all formulas will be based on stale cycleValuation data
  corporation.sharePrice = newSharePrice;

  return [profit, amount, privateShares];
}

export function acceptInvestmentOffer(corporation: Corporation): void {
  if (
    corporation.fundingRound >= corpConstants.fundingRoundShares.length ||
    corporation.fundingRound >= corpConstants.fundingRoundMultiplier.length ||
    corporation.public
  ) {
    throw new Error("没有更多可用的投资报价了。");
  }
  const val = corporation.valuation;
  const percShares = corpConstants.fundingRoundShares[corporation.fundingRound];
  const roundMultiplier = corpConstants.fundingRoundMultiplier[corporation.fundingRound];
  const funding = val * percShares * roundMultiplier;
  const investShares = Math.floor(corpConstants.initialShares * percShares);
  corporation.fundingRound++;
  corporation.gainFunds(funding, "private equity");

  corporation.numShares -= investShares;
  corporation.investorShares += investShares;
}

export function convertPriceString(price: string): string {
  /**
   * This is a common error. We check it here to provide a user-friendly error message before parsing.
   */
  if (price === "") {
    throw new Error("价格不能为空字符串。");
  }
  /**
   * Replace invalid characters. Only accepts:
   * - Digit characters
   * - 4 most basic algebraic operations (+ - * /)
   * - Parentheses
   * - Dot character
   * - Any characters in this list: [e, E, M, P]
   */
  const sanitizedPrice = price.replace(/[^\d+\-*/().eEMP]/g, "");

  // Replace MP with test numbers.
  for (const testNumber of [-1.2e123, -123456, 123456, 1.2e123]) {
    try {
      evaluateCorpFormula(sanitizedPrice, { MP: testNumber });
    } catch (error) {
      throw new Error(`出售价格字段的值或表达式无效：${error}`, { cause: error });
    }
  }

  // Use sanitized price.
  return sanitizedPrice;
}

export function convertAmountString(amount: string): string {
  /**
   * This is a common error. We check it here to provide a user-friendly error message before parsing.
   */
  if (amount === "") {
    throw new Error("数量不能为空字符串。");
  }
  /**
   * Replace invalid characters. Only accepts:
   * - Digit characters
   * - 4 most basic algebraic operations (+ - * /)
   * - Parentheses
   * - Dot character
   * - Any characters in this list: [e, E, M, A, X, P, R, O, D, I, N, V]
   */
  const sanitizedAmount = amount.replace(/[^\d+\-*/().eEMAXPRODINV]/g, "");

  for (const testNumber of [-1.2e123, -123456, 123456, 1.2e123]) {
    try {
      evaluateCorpFormula(sanitizedAmount, { MAX: testNumber, PROD: testNumber, INV: testNumber });
    } catch (error) {
      throw new Error(`出售数量字段的值或表达式无效：${error}`, { cause: error });
    }
  }

  // Use sanitized amount.
  return sanitizedAmount;
}

export function sellMaterial(material: Material, amount: string, price: string): void {
  const convertedPrice = convertPriceString(price.toUpperCase());
  const convertedAmount = convertAmountString(amount.toUpperCase());

  material.desiredSellPrice = convertedPrice;
  material.desiredSellAmount = convertedAmount;
}

export function sellProduct(product: Product, city: CityName, amt: string, price: string, all: boolean): void {
  const convertedPrice = convertPriceString(price.toUpperCase());
  const convertedAmount = convertAmountString(amt.toUpperCase());

  if (all) {
    for (const cityName of Object.values(CityName)) {
      product.cityData[cityName].desiredSellAmount = convertedAmount;
      product.cityData[cityName].desiredSellPrice = convertedPrice;
    }
  } else {
    product.cityData[city].desiredSellAmount = convertedAmount;
    product.cityData[city].desiredSellPrice = convertedPrice;
  }
}

export function setSmartSupply(warehouse: Warehouse, smartSupply: boolean): void {
  warehouse.smartSupplyEnabled = smartSupply;
}

export function setSmartSupplyOption(warehouse: Warehouse, material: Material, useOption: CorpSmartSupplyOption): void {
  warehouse.smartSupplyOptions[material.name] = useOption;
}

export function buyMaterial(division: Division, material: Material, amt: number): void {
  if (!isRelevantMaterial(material.name, division)) {
    throw new Error(`${material.name} 不是行业 ${division.industry} 的相关材料`);
  }
  if (!Number.isFinite(amt) || amt < 0) {
    throw new Error(
      `购买材料 '${material.name}' 的数量 '${amt}' 无效。必须是大于或等于0的数字`,
    );
  }
  material.buyAmount = amt;
}

export function bulkPurchase(
  corp: Corporation,
  division: Division,
  warehouse: Warehouse,
  material: Material,
  amt: number,
): void {
  if (!isRelevantMaterial(material.name, division)) {
    throw new Error(`${material.name} 不是行业 ${division.industry} 的相关材料`);
  }
  const matSize = MaterialInfo[material.name].size;
  const maxAmount = (warehouse.size - warehouse.sizeUsed) / matSize;
  if (!Number.isFinite(amt) || amt < 0) {
    throw new Error(
      `购买材料 '${material.name}' 的数量 '${amt}' 无效。必须是大于或等于0的数字`,
    );
  }
  if (amt > maxAmount) {
    throw new Error(`你的仓库空间不足，无法容纳这次购买`);
  }
  // Special case: if "amount" is 0, this is a no-op.
  if (amt === 0) {
    return;
  }
  const cost = amt * material.marketPrice;
  if (corp.funds < cost) {
    throw new Error(`你负担不起这次购买。`);
  }
  corp.loseFunds(cost, "materials");
  material.averagePrice =
    (material.averagePrice * material.stored + material.marketPrice * amt) / (material.stored + amt);
  material.stored += amt;
  warehouse.sizeUsed = warehouse.sizeUsed + amt * matSize;
}

export function sellShares(corporation: Corporation, numShares: number): number {
  const failureReason = sellSharesFailureReason(corporation, numShares);
  if (failureReason) throw new Error(failureReason);

  const [profit, newSharePrice, newSharesUntilUpdate] = corporation.calculateShareSale(numShares);

  corporation.numShares -= numShares;
  corporation.issuedShares += numShares;
  corporation.sharePrice = newSharePrice;
  corporation.shareSalesUntilPriceUpdate = newSharesUntilUpdate;
  corporation.shareSaleCooldown = corpConstants.sellSharesCooldown;
  Player.gainMoney(profit, "corporation");
  return profit;
}

export function buyBackShares(corporation: Corporation, numShares: number): boolean {
  const failureReason = buybackSharesFailureReason(corporation, numShares);
  if (failureReason) throw new Error(failureReason);

  const [cost, newSharePrice, newSharesUntilUpdate] = corporation.calculateShareBuyback(numShares);

  corporation.numShares += numShares;
  corporation.issuedShares -= numShares;
  corporation.sharePrice = newSharePrice;
  corporation.shareSalesUntilPriceUpdate = newSharesUntilUpdate;
  Player.loseMoney(cost, "corporation");
  return true;
}

export function upgradeOfficeSize(corp: Corporation, office: OfficeSpace, increase: PositiveInteger): void {
  const cost = calculateOfficeSizeUpgradeCost(office.size, increase);
  if (corp.funds < cost) return;
  office.size += increase;
  corp.loseFunds(cost, "office");
}

export function buyTea(corp: Corporation, office: OfficeSpace): boolean {
  const cost = office.getTeaCost();
  if (corp.funds < cost || !office.setTea()) return false;
  corp.loseFunds(cost, "tea");
  return true;
}

export function throwParty(corp: Corporation, office: OfficeSpace, costPerEmployee: number): number {
  const mult = 1 + costPerEmployee / 10e6;
  const cost = costPerEmployee * office.numEmployees;
  if (corp.funds < cost) {
    return 0;
  }

  if (!office.setParty(mult)) {
    return 0;
  }
  corp.loseFunds(cost, "parties");

  return mult;
}

export function purchaseWarehouse(corp: Corporation, division: Division, city: CityName): void {
  if (corp.funds < corpConstants.warehouseInitialCost) return;
  if (division.warehouses[city]) return;
  corp.loseFunds(corpConstants.warehouseInitialCost, "division");
  division.warehouses[city] = new Warehouse({
    division: division,
    loc: city,
    size: corpConstants.warehouseInitialSize,
  });
  ++corp.numberOfOfficesAndWarehouses;
}

export function upgradeWarehouseCost(level: number, amt: number): number {
  return Array.from(Array(amt).keys()).reduce(
    (acc, index) => acc + corpConstants.warehouseSizeUpgradeCostBase * Math.pow(1.07, level + 1 + index),
    0,
  );
}

export function upgradeWarehouse(corp: Corporation, division: Division, warehouse: Warehouse, amt = 1): void {
  const sizeUpgradeCost = upgradeWarehouseCost(warehouse.level, amt);
  if (corp.funds < sizeUpgradeCost) return;
  warehouse.level += amt;
  warehouse.updateSize(corp, division);
  corp.loseFunds(sizeUpgradeCost, "warehouse");
}

export function hireAdVert(corp: Corporation, division: Division): void {
  const cost = division.getAdVertCost();
  if (corp.funds < cost) return;
  corp.loseFunds(cost, "advert");
  division.applyAdVert(corp);
}

export function makeProduct(
  corp: Corporation,
  division: Division,
  city: CityName,
  productName: string,
  designInvest: number,
  marketingInvest: number,
): void {
  // For invalid investment inputs, just use 0
  if (isNaN(designInvest) || designInvest < 0) designInvest = 0;
  if (isNaN(marketingInvest) || marketingInvest < 0) marketingInvest = 0;

  if (!division.offices[city]) {
    throw new Error(`无法在没有办事处的城市开发产品！`);
  }
  if (productName == null || productName === "") {
    throw new Error("你必须为产品指定一个名称！");
  }
  if (!division.makesProducts) {
    throw new Error("你不能为该行业开发产品！");
  }
  if (corp.funds < designInvest + marketingInvest) {
    throw new Error("公司资金不足，无法进行这么大的投资");
  }
  if (division.products.size >= division.maxProducts) {
    throw new Error(`部门 ${division.name} 的产品数量已达上限（${division.maxProducts}）！`);
  }

  const product = new Product({
    name: productName.replace(/[<>]/g, "").trim(), //Sanitize for HTMl elements?
    createCity: city,
    designInvestment: designInvest,
    advertisingInvestment: marketingInvest,
  });
  if (division.products.has(product.name)) {
    throw new Error(`你已经拥有同名产品了！`);
  }

  corp.loseFunds(designInvest + marketingInvest, "product development");
  division.products.set(product.name, product);
}

export function research(researchingDivision: Division, researchName: CorpResearchName): void {
  const corp = Player.corporation;
  if (!corp) return;
  const researchTree = IndustryResearchTrees[researchingDivision.industry];
  if (researchTree === undefined) throw new Error(`行业 '${researchingDivision.industry}' 没有研究树`);
  const research = ResearchMap[researchName];
  const researchNode = researchTree.findNode(researchName);
  if (!researchNode) {
    return;
  }
  const researchPreReq = researchNode.parent?.researchName;
  //Check to see if the research request has any pre-reqs that need to be researched first.
  if (researchPreReq) {
    if (!researchingDivision.researched?.has(researchPreReq)) {
      throw new Error(
        `部门 ${researchingDivision.name} 需要先研究 ${researchPreReq}，才能研究 ${research.name}`,
      );
    }
  }
  if (researchingDivision.researched.has(researchName)) return;
  if (researchingDivision.researchPoints < research.cost) {
    throw new Error(`你的科研点数不足以研究 ${research.name}`);
  }
  researchingDivision.researchPoints -= research.cost;

  // Get the Node from the Research Tree and set its 'researched' property
  researchTree.research(researchName);
  // All divisions of the same type as the researching division get the new research.
  for (const division of corp.divisions.values()) {
    if (division.industry !== researchingDivision.industry) continue;
    division.researched.add(researchName);
    // Handle researches that need to have their effects manually applied here.
    // Warehouse size needs to be updated here because it is not recalculated during normal processing.
    if (researchName == "Drones - Transport") {
      for (const warehouse of getRecordValues(division.warehouses)) {
        warehouse.updateSize(corp, division);
      }
    }
  }
}

/** Set a new export for a material. Throw on any invalid input. */
export function exportMaterial(
  targetDivision: Division,
  targetCity: CityName,
  material: Material,
  amount: string,
): void {
  if (!isRelevantMaterial(material.name, targetDivision)) {
    throw new Error(`无法将材料 ${material.name} 出口到部门 ${targetDivision.name}！`);
  }
  if (!targetDivision.warehouses[targetCity]) {
    throw new Error(`无法出口到部门 ${targetDivision.name} 的 ${targetCity}，因为那里没有仓库。`);
  }
  if (material === targetDivision.warehouses[targetCity]?.materials[material.name]) {
    throw new Error(`源部门和目标部门/城市不能相同。`);
  }
  for (const existingExport of material.exports) {
    if (existingExport.division === targetDivision.name && existingExport.city === targetCity) {
      throw new Error(`试图初始化一个指向重复仓库的出口。
目标仓库（部门 / 城市）：${existingExport.division} / ${existingExport.city}
现有出口数量：${existingExport.amount}
尝试导出的数量：${amount}`);
    }
  }

  // Perform sanitization and tests
  let sanitizedAmt = amount.replace(/\s+/g, "").toUpperCase();
  sanitizedAmt = sanitizedAmt.replace(/[^-()\d/*+.MAXEPRODINV]/g, "");
  for (const testReplacement of [1.23, -1.23]) {
    try {
      evaluateCorpFormula(sanitizedAmt, {
        MAX: testReplacement,
        IPROD: testReplacement,
        EPROD: testReplacement,
        IINV: testReplacement,
        EINV: testReplacement,
      });
    } catch (error) {
      throw new Error(
        `设置 ${material.name} 的出口数量时出错。
你的输入：${amount}
清理后的输入：${sanitizedAmt}
遇到的错误：${error}`,
      );
    }
  }

  const exportObj = { division: targetDivision.name, city: targetCity, amount: sanitizedAmt };
  material.exports.push(exportObj);
}

export function cancelExportMaterial(divisionName: string, cityName: CityName, material: Material): void {
  const index = material.exports.findIndex((exp) => exp.division === divisionName && exp.city === cityName);
  if (index === -1) return;
  material.exports.splice(index, 1);
}

export function limitProductProduction(product: Product, cityName: CityName, quantity: number): void {
  if (quantity < 0 || isNaN(quantity)) {
    product.cityData[cityName].productionLimit = null;
  } else {
    product.cityData[cityName].productionLimit = quantity;
  }
}

export function limitMaterialProduction(material: Material, quantity: number): void {
  if (quantity < 0 || isNaN(quantity)) {
    material.productionLimit = null;
  } else {
    material.productionLimit = quantity;
  }
}

export function setMaterialMarketTA1(material: Material, on: boolean): void {
  material.marketTa1 = on;
}

export function setMaterialMarketTA2(material: Material, on: boolean): void {
  material.marketTa2 = on;
}

export function setProductMarketTA1(product: Product, on: boolean): void {
  product.marketTa1 = on;
}

export function setProductMarketTA2(product: Product, on: boolean): void {
  product.marketTa2 = on;
}

export function bribe(
  corporation: Corporation,
  fundsForBribing: number,
  factionName: FactionName,
): Result<{ reputationGain: number }> {
  if (!Number.isFinite(fundsForBribing) || fundsForBribing <= 0 || corporation.funds < fundsForBribing) {
    return {
      success: false,
      message: "用于贿赂的金额无效。",
    };
  }
  if (corporation.valuation < corpConstants.bribeThreshold) {
    return {
      success: false,
      message: `企业估值低于门槛值。门槛：${formatNumber(
        corpConstants.bribeThreshold,
      )}。`,
    };
  }
  if (!Player.factions.includes(factionName)) {
    return {
      success: false,
      message: `你不是 ${factionName} 的成员。`,
    };
  }
  const faction = Factions[factionName];
  const factionInfo = faction.getInfo();
  if (!factionInfo.offersWork()) {
    return {
      success: false,
      message: `${factionName} 无法被贿赂。它不提供任何类型的工作。`,
    };
  }

  const reputationGain = fundsForBribing / corpConstants.bribeAmountPerReputation;
  faction.playerReputation += reputationGain;
  corporation.loseFunds(fundsForBribing, "bribery");

  return {
    success: true,
    reputationGain,
  };
}
