import { Player } from "@player";
import { CorpResearchName, CorpSmartSupplyOption } from "@nsdefs";

import { MaterialInfo } from "./MaterialInfo";
import { Corporation } from "./Corporation";
import { IndustryResearchTrees, IndustriesData } from "./data/IndustryData";
import { Division } from "./Division";
import * as corpConstants from "./data/Constants";
import { OfficeSpace } from "./OfficeSpace";
import { Material } from "./Material";
import { Product } from "./Product";
import { Warehouse } from "./Warehouse";
import { CreatingCorporationCheckResult, FactionName, IndustryType } from "@enums";
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
} from "./helpers";
import { PositiveInteger, Result } from "../types";
import { Factions } from "../Faction/Factions";
import { throwIfReachable } from "../utils/helpers/throwIfReachable";
import { formatMoney } from "../ui/formatNumber";

export function createCorporation(corporationName: string, selfFund: boolean, restart: boolean): Result {
  const checkResult = canCreateCorporation(selfFund, restart);
  switch (checkResult) {
    case CreatingCorporationCheckResult.Success:
      break;
    case CreatingCorporationCheckResult.NoSf3OrDisabled:
    case CreatingCorporationCheckResult.CorporationExists:
      return { success: false, message: convertCreatingCorporationCheckResultToMessage(checkResult) };
    case CreatingCorporationCheckResult.UseSeedMoneyOutsideBN3:
    case CreatingCorporationCheckResult.DisabledBySoftCap:
      // In order to maintain backward compatibility, we have to throw an error in these cases.
      throw new Error(convertCreatingCorporationCheckResultToMessage(checkResult));
    default:
      throwIfReachable(checkResult);
  }

  if (!corporationName) {
    return { success: false, message: "Corporation name cannot be an empty string." };
  }

  if (selfFund) {
    const cost = costOfCreatingCorporation(restart);
    if (!Player.canAfford(cost)) {
      return {
        success: false,
        message: `You don't have enough money to create a corporation. It costs ${formatMoney(cost)}.`,
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
    throw new Error(`Cannot expand into ${industry} industry, too many divisions!`);

  if (corporation.divisions.has(name)) throw new Error(`Division name ${name} is already in use!`);
  // "Overview" is forbidden as a division name, see CorporationRoot.tsx for why this would cause issues.
  if (name === "Overview") throw new Error(`"Overview" is a forbidden division name.`);

  const data = IndustriesData[industry];
  if (!data) throw new Error(`Invalid industry: '${industry}'`);
  const cost = data.startingCost;
  if (corporation.funds < cost) {
    throw new Error("Not enough money to create a new division in this industry");
  } else if (name === "") {
    throw new Error("New division must have a name!");
  } else {
    corporation.loseFunds(cost, "division");
    corporation.divisions.set(
      name,
      new Division({
        corp: corporation,
        name: name,
        type: industry,
      }),
    );
    corporation.numberOfOfficesAndWarehouses += 2;
  }
}

export function removeDivision(corporation: Corporation, name: string): number {
  const division = corporation.divisions.get(name);
  if (!division) throw new Error("There is no division called " + name);
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
    throw new Error("You don't have enough company funds to open a new office!");
  }
  if (division.offices[city]) {
    throw new Error(`You have already expanded into ${city} for ${division.name}`);
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
    throw new Error(`Invalid value. Must be an number between 0 and ${corpConstants.dividendMaxRate}`);
  }

  corporation.dividendRate = rate;
}

export function goPublic(corporation: Corporation, numShares: number): void {
  const ceoOwnership = (corporation.numShares - numShares) / corporation.totalShares;
  const initialSharePrice = corporation.getTargetSharePrice(ceoOwnership);

  if (isNaN(numShares) || numShares < 0) {
    throw new Error("Invalid value for number of issued shares");
  }
  if (numShares > corporation.numShares) {
    throw new Error("You don't have that many shares to issue!");
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
    throw new Error("No more investment offers are available.");
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
   * This is a common error. We should check it to get a "user-friendly" error message. If we pass an empty string to
   * eval(), it will return undefined, and the "is-it-a-valid-number" following check will throw an unhelpful error
   * message.
   */
  if (price === "") {
    throw new Error("Price cannot be an empty string.");
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
    const temp = sanitizedPrice.replace(/MP/g, testNumber.toString());
    let evaluatedTemp: unknown;
    try {
      evaluatedTemp = eval?.(temp);
      if (typeof evaluatedTemp !== "number" || !Number.isFinite(evaluatedTemp)) {
        throw new Error(
          `Evaluated value is not a valid number: ${evaluatedTemp}. Price: ${price}. sanitizedPrice: ${sanitizedPrice}. testNumber: ${testNumber}.`,
        );
      }
    } catch (error) {
      throw new Error(`Invalid value or expression for sell price field: ${error}`, { cause: error });
    }
  }

  // Use sanitized price.
  return sanitizedPrice;
}

export function convertAmountString(amount: string): string {
  /**
   * This is a common error. We should check it to get a "user-friendly" error message. If we pass an empty string to
   * eval(), it will return undefined, and the "is-it-a-valid-number" following check will throw an unhelpful error
   * message.
   */
  if (amount === "") {
    throw new Error("Amount cannot be an empty string.");
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
    let temp = sanitizedAmount.replace(/MAX/g, testNumber.toString());
    temp = temp.replace(/PROD/g, testNumber.toString());
    temp = temp.replace(/INV/g, testNumber.toString());
    let evaluatedTemp: unknown;
    try {
      evaluatedTemp = eval?.(temp);
      if (typeof evaluatedTemp !== "number" || !Number.isFinite(evaluatedTemp)) {
        throw new Error(
          `Evaluated value is not a valid number: ${evaluatedTemp}. Amount: ${amount}. sanitizedAmount: ${sanitizedAmount}. testNumber: ${testNumber}.`,
        );
      }
    } catch (error) {
      throw new Error(`Invalid value or expression for sell quantity field: ${error}`, { cause: error });
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
    throw new Error(`${material.name} is not a relevant material for industry ${division.type}`);
  }
  if (!Number.isFinite(amt) || amt < 0) {
    throw new Error(
      `Invalid amount '${amt}' to buy material '${material.name}'. Must be numeric and greater than or equal to 0`,
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
    throw new Error(`${material.name} is not a relevant material for industry ${division.type}`);
  }
  const matSize = MaterialInfo[material.name].size;
  const maxAmount = (warehouse.size - warehouse.sizeUsed) / matSize;
  if (!Number.isFinite(amt) || amt < 0) {
    throw new Error(
      `Invalid amount '${amt}' to buy material '${material.name}'. Must be numeric and greater than or equal to 0`,
    );
  }
  if (amt > maxAmount) {
    throw new Error(`You do not have enough warehouse size to fit this purchase`);
  }
  // Special case: if "amount" is 0, this is a no-op.
  if (amt === 0) {
    return;
  }
  const cost = amt * material.marketPrice;
  if (corp.funds < cost) {
    throw new Error(`You cannot afford this purchase.`);
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

export function upgradeWarehouseCost(warehouse: Warehouse, amt: number): number {
  return Array.from(Array(amt).keys()).reduce(
    (acc, index) => acc + corpConstants.warehouseSizeUpgradeCostBase * Math.pow(1.07, warehouse.level + 1 + index),
    0,
  );
}

export function upgradeWarehouse(corp: Corporation, division: Division, warehouse: Warehouse, amt = 1): void {
  const sizeUpgradeCost = upgradeWarehouseCost(warehouse, amt);
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
    throw new Error(`Cannot develop a product in a city without an office!`);
  }
  if (productName == null || productName === "") {
    throw new Error("You must specify a name for your product!");
  }
  if (!division.makesProducts) {
    throw new Error("You cannot create products for this industry!");
  }
  if (corp.funds < designInvest + marketingInvest) {
    throw new Error("You don't have enough company funds to make this large of an investment");
  }
  if (division.products.size >= division.maxProducts) {
    throw new Error(`You are already at the max products (${division.maxProducts}) for division: ${division.name}!`);
  }

  const product = new Product({
    name: productName.replace(/[<>]/g, "").trim(), //Sanitize for HTMl elements?
    createCity: city,
    designInvestment: designInvest,
    advertisingInvestment: marketingInvest,
  });
  if (division.products.has(product.name)) {
    throw new Error(`You already have a product with this name!`);
  }

  corp.loseFunds(designInvest + marketingInvest, "product development");
  division.products.set(product.name, product);
}

export function research(researchingDivision: Division, researchName: CorpResearchName): void {
  const corp = Player.corporation;
  if (!corp) return;
  const researchTree = IndustryResearchTrees[researchingDivision.type];
  if (researchTree === undefined) throw new Error(`No research tree for industry '${researchingDivision.type}'`);
  const research = ResearchMap[researchName];
  const researchNode = researchTree.findNode(researchName);
  const researchPreReq = researchNode?.parent?.researchName;
  //Check to see if the research request has any pre-reqs that need to be researched first.
  if (researchPreReq) {
    if (!researchingDivision.researched?.has(researchPreReq)) {
      throw new Error(
        `Division ${researchingDivision.name} requires ${researchPreReq} before researching ${research.name}`,
      );
    }
  }
  if (researchingDivision.researched.has(researchName)) return;
  if (researchingDivision.researchPoints < research.cost) {
    throw new Error(`You do not have enough Scientific Research for ${research.name}`);
  }
  researchingDivision.researchPoints -= research.cost;

  // Get the Node from the Research Tree and set its 'researched' property
  researchTree.research(researchName);
  // All divisions of the same type as the researching division get the new research.
  for (const division of corp.divisions.values()) {
    if (division.type !== researchingDivision.type) continue;
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
    throw new Error(`You cannot export material: ${material.name} to division: ${targetDivision.name}!`);
  }
  if (!targetDivision.warehouses[targetCity]) {
    throw new Error(`Cannot export to ${targetCity} in division ${targetDivision.name} because there is no warehouse.`);
  }
  if (material === targetDivision.warehouses[targetCity]?.materials[material.name]) {
    throw new Error(`Source and target division/city cannot be the same.`);
  }
  for (const existingExport of material.exports) {
    if (existingExport.division === targetDivision.name && existingExport.city === targetCity) {
      throw new Error(`Tried to initialize an export to a duplicate warehouse.
Target warehouse (division / city): ${existingExport.division} / ${existingExport.city}
Existing export amount: ${existingExport.amount}
Attempted export amount: ${amount}`);
    }
  }

  // Perform sanitization and tests
  let sanitizedAmt = amount.replace(/\s+/g, "").toUpperCase();
  sanitizedAmt = sanitizedAmt.replace(/[^-()\d/*+.MAXEPRODINV]/g, "");
  for (const testReplacement of ["(1.23)", "(-1.23)"]) {
    const replaced = sanitizedAmt.replace(/(MAX|IPROD|EPROD|IINV|EINV)/g, testReplacement);
    let evaluated: unknown;
    try {
      evaluated = eval?.(replaced);
      if (typeof evaluated !== "number" || !Number.isFinite(evaluated)) {
        throw new Error(`Evaluated value is not a valid number: ${evaluated}`);
      }
    } catch (error) {
      throw new Error(
        `Error while trying to set the exported amount of ${material.name}.
Error occurred while testing keyword replacement with ${testReplacement}.
Your input: ${amount}
Sanitized input: ${sanitizedAmt}
Input after replacement: ${replaced}
Evaluated value: ${evaluated}
Error encountered: ${error}`,
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
  if (corporation.valuation < corpConstants.bribeThreshold) {
    return {
      success: false,
      message: `The corporation valuation is below the threshold. Threshold: ${corpConstants.bribeThreshold}.`,
    };
  }
  if (!Number.isFinite(fundsForBribing) || fundsForBribing <= 0 || corporation.funds < fundsForBribing) {
    return {
      success: false,
      message: "Invalid amount of cash for bribing",
    };
  }
  const faction = Factions[factionName];
  const factionInfo = faction.getInfo();
  if (!factionInfo.offersWork()) {
    return {
      success: false,
      message: `${factionName} cannot be bribed. It does not offer any types of work.`,
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
