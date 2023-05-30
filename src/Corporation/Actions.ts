import { Player } from "@player";
import { MaterialInfo } from "./MaterialInfo";
import { Corporation } from "./Corporation";
import { IndustryResearchTrees, IndustriesData } from "./IndustryData";
import { Division } from "./Division";
import * as corpConstants from "./data/Constants";
import { OfficeSpace } from "./OfficeSpace";
import { Material } from "./Material";
import { Product } from "./Product";
import { Warehouse } from "./Warehouse";
import { IndustryType } from "./data/Enums";
import { ResearchMap } from "./ResearchMap";
import { isRelevantMaterial } from "./ui/Helpers";
import { CityName } from "../Enums";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { CorpResearchName } from "@nsdefs";
import { isInteger } from "lodash";
import { getRecordValues } from "../Types/Record";

export function NewDivision(corporation: Corporation, industry: IndustryType, name: string): void {
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
    corporation.funds = corporation.funds - cost;
    corporation.divisions.set(
      name,
      new Division({
        corp: corporation,
        name: name,
        type: industry,
      }),
    );
  }
}

export function removeDivision(corporation: Corporation, name: string) {
  if (!corporation.divisions.has(name)) throw new Error("There is no division called " + name);
  corporation.divisions.delete(name);
}

export function purchaseOffice(corporation: Corporation, division: Division, city: CityName): void {
  if (corporation.funds < corpConstants.officeInitialCost) {
    throw new Error("You don't have enough company funds to open a new office!");
  }
  if (division.offices[city]) {
    throw new Error(`You have already expanded into ${city} for ${division.name}`);
  }
  corporation.funds = corporation.funds - corpConstants.officeInitialCost;
  division.offices[city] = new OfficeSpace({
    city: city,
    size: corpConstants.officeInitialSize,
  });
}

export function IssueDividends(corporation: Corporation, rate: number): void {
  if (isNaN(rate) || rate < 0 || rate > corpConstants.dividendMaxRate) {
    throw new Error(`Invalid value. Must be an number between 0 and ${corpConstants.dividendMaxRate}`);
  }

  corporation.dividendRate = rate;
}

export function IssueNewShares(corporation: Corporation, amount: number): [number, number, number] {
  const max = corporation.calculateMaxNewShares();

  // Round to nearest ten-millionth
  amount = Math.round(amount / 10e6) * 10e6;

  if (isNaN(amount) || amount < 10e6 || amount > max) {
    throw new Error(`Invalid value. Must be an number between 10m and ${max} (20% of total shares)`);
  }

  const newSharePrice = Math.round(corporation.sharePrice * 0.8);

  const profit = amount * newSharePrice;
  corporation.issueNewSharesCooldown = corpConstants.issueNewSharesCooldown;

  const privateOwnedRatio = 1 - (corporation.numShares + corporation.issuedShares) / corporation.totalShares;
  const maxPrivateShares = Math.round((amount / 2) * privateOwnedRatio);
  const privateShares = Math.round(getRandomInt(0, maxPrivateShares) / 10e6) * 10e6;

  corporation.issuedShares += amount - privateShares;
  corporation.totalShares += amount;
  corporation.funds = corporation.funds + profit;
  corporation.immediatelyUpdateSharePrice();

  return [profit, amount, privateShares];
}

export function SellMaterial(material: Material, amount: string, price: string): void {
  if (price === "") price = "0";
  if (amount === "") amount = "0";
  let cost = price.replace(/\s+/g, "");
  cost = cost.replace(/[^-()\d/*+.MPe]/g, ""); //Sanitize cost
  let temp = cost.replace(/MP/, "1.234e5");
  try {
    if (temp.includes("MP")) throw "Only one reference to MP is allowed in sell price.";
    temp = eval(temp);
  } catch (e) {
    throw new Error("Invalid value or expression for sell price field: " + e);
  }

  if (temp == null || isNaN(parseFloat(temp))) {
    throw new Error("Invalid value or expression for sell price field");
  }

  if (cost.includes("MP")) {
    material.desiredSellPrice = cost; //Dynamically evaluated
  } else {
    material.desiredSellPrice = temp;
  }

  //Parse quantity
  amount = amount.toUpperCase();
  if (amount.includes("MAX") || amount.includes("PROD") || amount.includes("INV")) {
    let q = amount.replace(/\s+/g, "");
    q = q.replace(/[^-()\d/*+.MAXPRODINV]/g, "");
    let tempQty = q.replace(/MAX/g, material.maxSellPerCycle.toString());
    tempQty = tempQty.replace(/PROD/g, material.productionAmount.toString());
    tempQty = tempQty.replace(/INV/g, material.productionAmount.toString());
    try {
      tempQty = eval(tempQty);
    } catch (e) {
      throw new Error("Invalid value or expression for sell quantity field: " + e);
    }

    if (tempQty == null || isNaN(parseFloat(tempQty))) {
      throw new Error("Invalid value or expression for sell quantity field");
    }
    material.desiredSellAmount = q; //Use sanitized input
  } else if (isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
    throw new Error("Invalid value for sell quantity field! Must be numeric or 'PROD' or 'MAX'");
  } else {
    let q = parseFloat(amount);
    if (isNaN(q)) {
      q = 0;
    }
    material.desiredSellAmount = q;
  }
}

export function SellProduct(product: Product, city: CityName, amt: string, price: string, all: boolean): void {
  //Parse price
  if (price.includes("MP")) {
    //Dynamically evaluated quantity. First test to make sure its valid
    //Sanitize input, then replace dynamic variables with arbitrary numbers
    price = price.replace(/\s+/g, "");
    price = price.replace(/[^-()\d/*+.MPe]/g, "");
    let temp = price.replace(/MP/, "1.234e5");
    try {
      if (temp.includes("MP")) throw "Only one reference to MP is allowed in sell price.";
      temp = eval(temp);
    } catch (e) {
      throw new Error("Invalid value or expression for sell price field: " + e);
    }
    if (temp == null || isNaN(parseFloat(temp))) {
      throw new Error("Invalid value or expression for sell price field.");
    }
    product.cityData[city].desiredSellPrice = price; //Use sanitized price
  } else {
    const cost = parseFloat(price);
    if (isNaN(cost)) {
      throw new Error("Invalid value for sell price field");
    }
    product.cityData[city].desiredSellPrice = cost;
  }

  // Parse quantity
  amt = amt.toUpperCase();
  if (amt.includes("MAX") || amt.includes("PROD") || amt.includes("INV")) {
    //Dynamically evaluated quantity. First test to make sure its valid
    let qty = amt.replace(/\s+/g, "");
    qty = qty.replace(/[^-()\d/*+.MAXPRODINV]/g, "");
    let temp = qty.replace(/MAX/g, product.maxSellAmount.toString());
    temp = temp.replace(/PROD/g, product.cityData[city].productionAmount.toString());
    temp = temp.replace(/INV/g, product.cityData[city].stored.toString());
    try {
      temp = eval(temp);
    } catch (e) {
      throw new Error("Invalid value or expression for sell quantity field: " + e);
    }

    if (temp == null || isNaN(parseFloat(temp))) {
      throw new Error("Invalid value or expression for sell quantity field");
    }
    if (all) {
      for (const cityName of Object.values(CityName)) {
        product.cityData[cityName].desiredSellAmount = qty; //Use sanitized input
      }
    } else {
      product.cityData[city].desiredSellAmount = qty; //Use sanitized input
    }
  } else if (isNaN(parseFloat(amt)) || parseFloat(amt) < 0) {
    throw new Error("Invalid value for sell quantity field! Must be numeric or 'PROD' or 'MAX'");
  } else {
    let qty = parseFloat(amt);
    if (isNaN(qty)) {
      qty = 0;
    }
    if (qty === 0) {
      if (all) {
        for (const cityName of Object.values(CityName)) {
          product.cityData[cityName].desiredSellAmount = 0;
        }
      } else {
        product.cityData[city].desiredSellAmount = 0;
      }
    } else if (all) {
      for (const cityName of Object.values(CityName)) {
        product.cityData[cityName].desiredSellAmount = qty;
      }
    } else {
      product.cityData[city].desiredSellAmount = qty;
    }
  }
}

export function SetSmartSupply(warehouse: Warehouse, smartSupply: boolean): void {
  warehouse.smartSupplyEnabled = smartSupply;
}

export function SetSmartSupplyOption(warehouse: Warehouse, material: Material, useOption: string): void {
  if (!corpConstants.smartSupplyUseOptions.includes(useOption)) {
    throw new Error(`Invalid Smart Supply option '${useOption}'`);
  }
  warehouse.smartSupplyOptions[material.name] = useOption;
}

export function BuyMaterial(material: Material, amt: number): void {
  if (isNaN(amt) || amt < 0) {
    throw new Error(`Invalid amount '${amt}' to buy material '${material.name}'`);
  }
  material.buyAmount = amt;
}

export function BulkPurchase(corp: Corporation, warehouse: Warehouse, material: Material, amt: number): void {
  const matSize = MaterialInfo[material.name].size;
  const maxAmount = (warehouse.size - warehouse.sizeUsed) / matSize;
  if (isNaN(amt) || amt < 0) {
    throw new Error(`Invalid input amount`);
  }
  if (amt > maxAmount) {
    throw new Error(`You do not have enough warehouse size to fit this purchase`);
  }
  const cost = amt * material.marketPrice;
  if (corp.funds >= cost) {
    corp.funds = corp.funds - cost;
    material.stored += amt;
  } else {
    throw new Error(`You cannot afford this purchase.`);
  }
}

export function SellShares(corporation: Corporation, numShares: number): number {
  if (isNaN(numShares) || !isInteger(numShares)) throw new Error("Invalid value for number of shares");
  if (numShares <= 0) throw new Error("Invalid value for number of shares");
  if (numShares > corporation.numShares) throw new Error("You don't have that many shares to sell!");
  if (numShares === corporation.numShares) throw new Error("You cant't sell all your shares!");
  if (numShares > 1e14) throw new Error("Invalid value for number of shares");
  if (!corporation.public) throw new Error("You haven't gone public!");
  if (corporation.shareSaleCooldown) throw new Error("Share sale on cooldown!");
  const stockSaleResults = corporation.calculateShareSale(numShares);
  const profit = stockSaleResults[0];
  const newSharePrice = stockSaleResults[1];
  const newSharesUntilUpdate = stockSaleResults[2];

  corporation.numShares -= numShares;
  corporation.issuedShares += numShares;
  corporation.sharePrice = newSharePrice;
  corporation.shareSalesUntilPriceUpdate = newSharesUntilUpdate;
  corporation.shareSaleCooldown = corpConstants.sellSharesCooldown;
  Player.gainMoney(profit, "corporation");
  return profit;
}

export function BuyBackShares(corporation: Corporation, numShares: number): boolean {
  if (isNaN(numShares) || !isInteger(numShares)) throw new Error("Invalid value for number of shares");
  if (numShares <= 0) throw new Error("Invalid value for number of shares");
  if (numShares > corporation.issuedShares) throw new Error("You don't have that many shares to buy!");
  if (!corporation.public) throw new Error("You haven't gone public!");
  const buybackPrice = corporation.sharePrice * 1.1;
  if (Player.money < numShares * buybackPrice) throw new Error("You cant afford that many shares!");
  corporation.numShares += numShares;
  corporation.issuedShares -= numShares;
  Player.loseMoney(numShares * buybackPrice, "corporation");
  return true;
}

export function UpgradeOfficeSize(corp: Corporation, office: OfficeSpace, size: number): void {
  const initialPriceMult = Math.round(office.size / corpConstants.officeInitialSize);
  const costMultiplier = 1.09;
  // Calculate cost to upgrade size by 15 employees
  let mult = 0;
  for (let i = 0; i < size / corpConstants.officeInitialSize; ++i) {
    mult += Math.pow(costMultiplier, initialPriceMult + i);
  }
  const cost = corpConstants.officeInitialCost * mult;
  if (corp.funds < cost) return;
  office.size += size;
  corp.funds = corp.funds - cost;
}

export function BuyTea(corp: Corporation, office: OfficeSpace): boolean {
  const cost = office.getTeaCost();
  if (corp.funds < cost || !office.setTea()) return false;
  corp.funds -= cost;
  return true;
}

export function ThrowParty(corp: Corporation, office: OfficeSpace, costPerEmployee: number): number {
  const mult = 1 + costPerEmployee / 10e6;
  const cost = costPerEmployee * office.numEmployees;
  if (corp.funds < cost) {
    return 0;
  }

  if (!office.setParty(mult)) {
    return 0;
  }
  corp.funds -= cost;

  return mult;
}

export function purchaseWarehouse(corp: Corporation, division: Division, city: CityName): void {
  if (corp.funds < corpConstants.warehouseInitialCost) return;
  if (division.warehouses[city]) return;
  corp.funds = corp.funds - corpConstants.warehouseInitialCost;
  division.warehouses[city] = new Warehouse({
    division: division,
    loc: city,
    size: corpConstants.warehouseInitialSize,
  });
}

export function UpgradeWarehouseCost(warehouse: Warehouse, amt: number): number {
  return Array.from(Array(amt).keys()).reduce(
    (acc, index) => acc + corpConstants.warehouseSizeUpgradeCostBase * Math.pow(1.07, warehouse.level + 1 + index),
    0,
  );
}

export function UpgradeWarehouse(corp: Corporation, division: Division, warehouse: Warehouse, amt = 1): void {
  const sizeUpgradeCost = UpgradeWarehouseCost(warehouse, amt);
  if (corp.funds < sizeUpgradeCost) return;
  warehouse.level += amt;
  warehouse.updateSize(corp, division);
  corp.funds = corp.funds - sizeUpgradeCost;
}

export function HireAdVert(corp: Corporation, division: Division): void {
  const cost = division.getAdVertCost();
  if (corp.funds < cost) return;
  corp.funds = corp.funds - cost;
  division.applyAdVert(corp);
}

export function MakeProduct(
  corp: Corporation,
  division: Division,
  city: CityName,
  productName: string,
  designInvest: number,
  marketingInvest: number,
): void {
  if (designInvest < 0) {
    designInvest = 0;
  }
  if (marketingInvest < 0) {
    marketingInvest = 0;
  }
  if (productName == null || productName === "") {
    throw new Error("You must specify a name for your product!");
  }
  if (!division.makesProducts) {
    throw new Error("You cannot create products for this industry!");
  }
  if (isNaN(designInvest)) {
    throw new Error("Invalid value for design investment");
  }
  if (isNaN(marketingInvest)) {
    throw new Error("Invalid value for marketing investment");
  }
  if (corp.funds < designInvest + marketingInvest) {
    throw new Error("You don't have enough company funds to make this large of an investment");
  }
  let maxProducts = 3;
  if (division.hasResearch("uPgrade: Capacity.II")) {
    maxProducts = 5;
  } else if (division.hasResearch("uPgrade: Capacity.I")) {
    maxProducts = 4;
  }
  if (division.products.size >= maxProducts) {
    throw new Error(`You are already at the max products (${maxProducts}) for division: ${division.name}!`);
  }

  const product = new Product({
    name: productName.replace(/[<>]/g, "").trim(), //Sanitize for HTMl elements
    createCity: city,
    designInvestment: designInvest,
    advertisingInvestment: marketingInvest,
  });
  if (division.products.has(product.name)) {
    throw new Error(`You already have a product with this name!`);
  }

  corp.funds = corp.funds - (designInvest + marketingInvest);
  division.products.set(product.name, product);
}

export function Research(researchingDivision: Division, researchName: CorpResearchName): void {
  const corp = Player.corporation;
  if (!corp) return;
  const researchTree = IndustryResearchTrees[researchingDivision.type];
  if (researchTree === undefined) throw new Error(`No research tree for industry '${researchingDivision.type}'`);
  const research = ResearchMap[researchName];

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

export function ExportMaterial(
  divisionName: string,
  cityName: CityName,
  material: Material,
  amt: string,
  division?: Division,
): void {
  // Sanitize amt
  let sanitizedAmt = amt.replace(/\s+/g, "").toUpperCase();
  sanitizedAmt = sanitizedAmt.replace(/[^-()\d/*+.MAXEPRODINV]/g, "");
  let temp = sanitizedAmt.replace(/MAX/g, "1");
  temp = temp.replace(/IPROD/g, "1");
  temp = temp.replace(/EPROD/g, "1");
  temp = temp.replace(/IINV/g, "1");
  temp = temp.replace(/EINV/g, "1");
  try {
    temp = eval(temp);
  } catch (e) {
    throw new Error("Invalid expression entered for export amount: " + e);
  }

  const n = parseFloat(temp);

  if (n == null || isNaN(n)) {
    throw new Error("Invalid amount entered for export");
  }

  if (!division || !isRelevantMaterial(material.name, division)) {
    throw new Error(`You cannot export material: ${material.name} to division: ${divisionName}!`);
  }

  const exportObj = { division: divisionName, city: cityName, amount: sanitizedAmt };
  material.exports.push(exportObj);
}

export function CancelExportMaterial(divisionName: string, cityName: string, material: Material, amt: string): void {
  for (let i = 0; i < material.exports.length; ++i) {
    if (
      material.exports[i].division !== divisionName ||
      material.exports[i].city !== cityName ||
      material.exports[i].amount !== amt
    )
      continue;
    material.exports.splice(i, 1);
    break;
  }
}

export function LimitProductProduction(product: Product, cityName: CityName, quantity: number): void {
  if (quantity < 0 || isNaN(quantity)) {
    product.cityData[cityName].productionLimit = null;
  } else {
    product.cityData[cityName].productionLimit = quantity;
  }
}

export function LimitMaterialProduction(material: Material, quantity: number): void {
  if (quantity < 0 || isNaN(quantity)) {
    material.productionLimit = null;
  } else {
    material.productionLimit = quantity;
  }
}

export function SetMaterialMarketTA1(material: Material, on: boolean): void {
  material.marketTa1 = on;
}

export function SetMaterialMarketTA2(material: Material, on: boolean): void {
  material.marketTa2 = on;
}

export function SetProductMarketTA1(product: Product, on: boolean): void {
  product.marketTa1 = on;
}

export function SetProductMarketTA2(product: Product, on: boolean): void {
  product.marketTa2 = on;
}
