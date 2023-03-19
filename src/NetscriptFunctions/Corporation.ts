import { Player, Player as player } from "../Player";

import { OfficeSpace } from "../Corporation/OfficeSpace";
import { Product } from "../Corporation/Product";
import { Material } from "../Corporation/Material";
import { Warehouse } from "../Corporation/Warehouse";
import { Industry } from "../Corporation/Industry";
import { Corporation } from "../Corporation/Corporation";
import { cloneDeep, omit } from "lodash";

import {
  Corporation as NSCorporation,
  Division as NSDivision,
  WarehouseAPI,
  OfficeAPI,
  InvestmentOffer,
  CorpResearchName,
} from "@nsdefs";

import {
  NewIndustry,
  NewCity,
  UnlockUpgrade,
  LevelUpgrade,
  IssueDividends,
  IssueNewShares,
  SellMaterial,
  SellProduct,
  SetSmartSupply,
  BuyMaterial,
  UpgradeOfficeSize,
  PurchaseWarehouse,
  UpgradeWarehouse,
  BuyTea,
  ThrowParty,
  HireAdVert,
  MakeProduct,
  Research,
  ExportMaterial,
  CancelExportMaterial,
  SetMaterialMarketTA1,
  SetMaterialMarketTA2,
  SetProductMarketTA1,
  SetProductMarketTA2,
  BulkPurchase,
  SellShares,
  BuyBackShares,
  SetSmartSupplyOption,
  LimitMaterialProduction,
  LimitProductProduction,
  UpgradeWarehouseCost,
} from "../Corporation/Actions";
import { CorporationUnlockUpgrades } from "../Corporation/data/CorporationUnlockUpgrades";
import { CorporationUpgrades } from "../Corporation/data/CorporationUpgrades";
import { allResearch, EmployeePosition, IndustryType, MaterialName } from "../Corporation/data/Enums";
import { IndustriesData, IndustryResearchTrees } from "../Corporation/IndustryData";
import * as corpConstants from "../Corporation/data/Constants";
import { ResearchMap } from "../Corporation/ResearchMap";
import { Factions } from "../Faction/Factions";
import { BitNodeMultipliers } from "../BitNode/BitNodeMultipliers";
import { InternalAPI, NetscriptContext, removedFunction } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/helpers/enum";
import { CityName } from "../data/Enums";
import { MaterialInfo } from "../Corporation/MaterialInfo";
import { FactionName } from "../Faction/data/Enums";

export function NetscriptCorporation(): InternalAPI<NSCorporation> {
  function createCorporation(corporationName: string, selfFund = true): boolean {
    if (!player.canAccessCorporation() || player.corporation) return false;
    if (!corporationName) return false;
    if (player.bitNodeN !== 3 && !selfFund) throw new Error("cannot use seed funds outside of BitNode 3");
    if (BitNodeMultipliers.CorporationSoftcap < 0.15)
      throw new Error(`You cannot create a corporation in Bitnode ${player.bitNodeN}`);

    if (selfFund) {
      if (!player.canAfford(150e9)) return false;

      player.startCorporation(corporationName, false);
      player.loseMoney(150e9, "corporation");
    } else {
      player.startCorporation(corporationName, true);
    }
    return true;
  }

  function hasUnlockUpgrade(upgradeName: string): boolean {
    const corporation = getCorporation();
    const upgrade = Object.values(CorporationUnlockUpgrades).find((upgrade) => upgrade.name === upgradeName);
    if (upgrade === undefined) throw new Error(`No upgrade named '${upgradeName}'`);
    const upgN = upgrade.index;
    return corporation.unlockUpgrades[upgN] === 1;
  }

  function getUnlockUpgradeCost(upgradeName: string): number {
    const upgrade = Object.values(CorporationUnlockUpgrades).find((upgrade) => upgrade.name === upgradeName);
    if (upgrade === undefined) throw new Error(`No upgrade named '${upgradeName}'`);
    return upgrade.price;
  }

  function getUpgradeLevel(ctx: NetscriptContext, _upgradeName: string): number {
    const upgradeName = helpers.string(ctx, "upgradeName", _upgradeName);
    const corporation = getCorporation();
    const upgrade = Object.values(CorporationUpgrades).find((upgrade) => upgrade.name === upgradeName);
    if (upgrade === undefined) throw new Error(`No upgrade named '${upgradeName}'`);
    const upgN = upgrade.index;
    return corporation.upgrades[upgN];
  }

  function getUpgradeLevelCost(ctx: NetscriptContext, _upgradeName: string): number {
    const upgradeName = helpers.string(ctx, "upgradeName", _upgradeName);
    const corporation = getCorporation();
    const upgrade = Object.values(CorporationUpgrades).find((upgrade) => upgrade.name === upgradeName);
    if (upgrade === undefined) throw new Error(`No upgrade named '${upgradeName}'`);
    const upgN = upgrade.index;
    const baseCost = upgrade.basePrice;
    const priceMult = upgrade.priceMult;
    const level = corporation.upgrades[upgN];
    return baseCost * Math.pow(priceMult, level);
  }

  function getInvestmentOffer(): InvestmentOffer {
    const corporation = getCorporation();
    if (
      corporation.fundingRound >= corpConstants.fundingRoundShares.length ||
      corporation.fundingRound >= corpConstants.fundingRoundMultiplier.length ||
      corporation.public
    )
      return {
        funds: 0,
        shares: 0,
        round: corporation.fundingRound + 1, // Make more readable
      }; // Don't throw an error here, no reason to have a second function to check if you can get investment.
    const val = corporation.valuation;
    const percShares = corpConstants.fundingRoundShares[corporation.fundingRound];
    const roundMultiplier = corpConstants.fundingRoundMultiplier[corporation.fundingRound];
    const funding = val * percShares * roundMultiplier;
    const investShares = Math.floor(corpConstants.initialShares * percShares);
    return {
      funds: funding,
      shares: investShares,
      round: corporation.fundingRound + 1, // Make more readable
    };
  }

  function acceptInvestmentOffer(): boolean {
    const corporation = getCorporation();
    if (
      corporation.fundingRound >= corpConstants.fundingRoundShares.length ||
      corporation.fundingRound >= corpConstants.fundingRoundMultiplier.length ||
      corporation.public
    )
      return false;
    const val = corporation.valuation;
    const percShares = corpConstants.fundingRoundShares[corporation.fundingRound];
    const roundMultiplier = corpConstants.fundingRoundMultiplier[corporation.fundingRound];
    const funding = val * percShares * roundMultiplier;
    const investShares = Math.floor(corpConstants.initialShares * percShares);
    corporation.fundingRound++;
    corporation.addFunds(funding);
    corporation.numShares -= investShares;
    return true;
  }

  function goPublic(numShares: number): boolean {
    const corporation = getCorporation();
    const initialSharePrice = corporation.valuation / corporation.totalShares;
    if (isNaN(numShares)) throw new Error("Invalid value for number of issued shares");
    if (numShares < 0) throw new Error("Invalid value for number of issued shares");
    if (numShares > corporation.numShares) throw new Error("You don't have that many shares to issue!");
    corporation.public = true;
    corporation.sharePrice = initialSharePrice;
    corporation.issuedShares = numShares;
    corporation.numShares -= numShares;
    corporation.addFunds(numShares * initialSharePrice);
    return true;
  }

  function getResearchCost(division: Industry, researchName: CorpResearchName): number {
    const researchTree = IndustryResearchTrees[division.type];
    if (researchTree === undefined) throw new Error(`No research tree for industry '${division.type}'`);
    const availableResearch = researchTree.getAllNodes();
    if (!availableResearch.includes(researchName)) throw new Error(`No research named '${researchName}'`);
    const research = ResearchMap[researchName];
    return research.cost;
  }

  function hasResearched(division: Industry, researchName: CorpResearchName): boolean {
    return division.researched[researchName] === undefined ? false : (division.researched[researchName] as boolean);
  }

  function bribe(factionName: FactionName, amountCash: number): boolean {
    if (!player.factions.includes(factionName)) throw new Error("Invalid faction name");
    if (isNaN(amountCash) || amountCash < 0)
      throw new Error("Invalid value for amount field! Must be numeric, greater than 0.");

    const corporation = getCorporation();
    if (corporation.funds < amountCash) return false;
    const faction = Factions[factionName];
    const info = faction.getInfo();
    if (!info.offersWork()) return false;
    if (player.hasGangWith(factionName)) return false;

    const repGain = amountCash / corpConstants.bribeAmountPerReputation;
    faction.playerReputation += repGain;
    corporation.funds = corporation.funds - amountCash;

    return true;
  }

  function getCorporation(): Corporation {
    const corporation = player.corporation;
    if (corporation === null) throw new Error("cannot be called without a corporation");
    return corporation;
  }

  function getDivision(divisionName: string): Industry {
    const corporation = getCorporation();
    const division = corporation.divisions.find((div) => div.name === divisionName);
    if (division === undefined) throw new Error(`No division named '${divisionName}'`);
    return division;
  }

  function getOffice(ctx: NetscriptContext, divisionName: string, _cityName: string): OfficeSpace {
    const division = getDivision(divisionName);
    const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
    const office = division.offices[cityName];
    if (!office) throw new Error(`${division.name} has not expanded to '${cityName}'`);
    return office;
  }

  function getWarehouse(ctx: NetscriptContext, divisionName: string, _cityName: string): Warehouse {
    const division = getDivision(divisionName);
    const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
    const warehouse = division.warehouses[cityName];
    if (!warehouse) throw new Error(`${division.name} does not have a warehouse in '${cityName}'`);
    return warehouse;
  }

  function getMaterial(
    ctx: NetscriptContext,
    divisionName: string,
    cityName: CityName,
    materialName: MaterialName,
  ): Material {
    const warehouse = getWarehouse(ctx, divisionName, cityName);
    const material = warehouse.materials[materialName];
    return material;
  }

  function getProduct(divisionName: string, productName: string): Product {
    const division = getDivision(divisionName);
    const product = division.products[productName];
    if (product === undefined) throw new Error(`Invalid product name: '${productName}'`);
    return product;
  }

  function checkAccess(ctx: NetscriptContext, api?: number): void {
    if (player.corporation === null) throw helpers.makeRuntimeErrorMsg(ctx, "Must own a corporation.");
    if (!api) return;

    if (!player.corporation.unlockUpgrades[api])
      throw helpers.makeRuntimeErrorMsg(ctx, "You do not have access to this API.");
  }

  function getSafeDivision(division: Industry): NSDivision {
    const cities: CityName[] = [];
    for (const office of Object.values(division.offices)) {
      if (!office) continue;
      cities.push(office.loc);
    }

    return {
      name: division.name,
      type: division.type,
      awareness: division.awareness,
      popularity: division.popularity,
      prodMult: division.prodMult,
      research: division.sciResearch,
      lastCycleRevenue: division.lastCycleRevenue,
      lastCycleExpenses: division.lastCycleExpenses,
      thisCycleRevenue: division.thisCycleRevenue,
      thisCycleExpenses: division.thisCycleExpenses,
      upgrades: [0, division.numAdVerts],
      cities: cities,
      products: division.products === undefined ? [] : Object.keys(division.products),
      makesProducts: division.makesProducts,
    };
  }

  const warehouseAPI: InternalAPI<WarehouseAPI> = {
    getUpgradeWarehouseCost: (ctx) => (_divisionName, _cityName, _amt) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const amt = helpers.number(ctx, "amount", _amt ?? 1);
      if (amt < 1) {
        throw helpers.makeRuntimeErrorMsg(ctx, "You must provide a positive number");
      }
      const warehouse = getWarehouse(ctx, divisionName, cityName);
      return UpgradeWarehouseCost(warehouse, amt);
    },
    hasWarehouse: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const division = getDivision(divisionName);
      const warehouse = division.warehouses[cityName];
      return warehouse !== 0;
    },
    getWarehouse: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const warehouse = getWarehouse(ctx, divisionName, cityName);
      return {
        level: warehouse.level,
        loc: warehouse.loc,
        size: warehouse.size,
        sizeUsed: warehouse.sizeUsed,
        smartSupplyEnabled: warehouse.smartSupplyEnabled,
      };
    },
    getMaterial: (ctx) => (_divisionName, _cityName, _materialName) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const material = getMaterial(ctx, divisionName, cityName, materialName);
      const corporation = getCorporation();
      const exports = material.exp.map((e) => {
        return { div: e.ind, loc: e.city, amt: e.amt };
      });
      return {
        cost: material.bCost,
        sCost: material.sCost,
        sAmt: material.sllman[1],
        name: material.name,
        qty: material.qty,
        qlt: material.qlt,
        dmd: corporation.unlockUpgrades[2] ? material.dmd : undefined,
        cmp: corporation.unlockUpgrades[3] ? material.cmp : undefined,
        prod: material.prd,
        sell: material.sll,
        exp: exports,
      };
    },
    getProduct: (ctx) => (_divisionName, _cityName, _productName) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const productName = helpers.string(ctx, "productName", _productName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const product = getProduct(divisionName, productName);
      const corporation = getCorporation();
      return {
        name: product.name,
        dmd: corporation.unlockUpgrades[2] ? product.dmd : undefined,
        cmp: corporation.unlockUpgrades[3] ? product.cmp : undefined,
        rat: product.rat,
        effRat: product.data[cityName][3],
        properties: {
          qlt: product.qlt,
          per: product.per,
          dur: product.dur,
          rel: product.rel,
          aes: product.aes,
          fea: product.fea,
        },
        pCost: product.pCost,
        sCost: product.sCost[cityName],
        sAmt: product.sllman[cityName][1],
        qty: product.data[cityName][0],
        prod: product.data[cityName][1],
        sell: product.data[cityName][2],
        developmentProgress: product.prog,
      };
    },
    purchaseWarehouse: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const corporation = getCorporation();
      PurchaseWarehouse(corporation, getDivision(divisionName), cityName);
    },
    upgradeWarehouse: (ctx) => (_divisionName, _cityName, _amt) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const amt = helpers.number(ctx, "amount", _amt ?? 1);
      const corporation = getCorporation();
      if (amt < 1) {
        throw helpers.makeRuntimeErrorMsg(ctx, "You must provide a positive number");
      }
      UpgradeWarehouse(corporation, getDivision(divisionName), getWarehouse(ctx, divisionName, cityName), amt);
    },
    sellMaterial: (ctx) => (_divisionName, _cityName, _materialName, _amt, _price) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const amt = helpers.string(ctx, "amt", _amt);
      const price = helpers.string(ctx, "price", _price);
      const material = getMaterial(ctx, divisionName, cityName, materialName);
      SellMaterial(material, amt, price);
    },
    sellProduct: (ctx) => (_divisionName, _cityName, _productName, _amt, _price, _all) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const productName = helpers.string(ctx, "productName", _productName);
      const amt = helpers.string(ctx, "amt", _amt);
      const price = helpers.string(ctx, "price", _price);
      const all = !!_all;
      const product = getProduct(divisionName, productName);
      SellProduct(product, cityName, amt, price, all);
    },
    discontinueProduct: (ctx) => (_divisionName, _productName) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const productName = helpers.string(ctx, "productName", _productName);
      getDivision(divisionName).discontinueProduct(getProduct(divisionName, productName));
    },
    setSmartSupply: (ctx) => (_divisionName, _cityName, _enabled) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const enabled = !!_enabled;
      const warehouse = getWarehouse(ctx, divisionName, cityName);
      if (!hasUnlockUpgrade("Smart Supply"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not purchased the Smart Supply upgrade!`);
      SetSmartSupply(warehouse, enabled);
    },
    setSmartSupplyOption: (ctx) => (_divisionName, _cityName, _materialName, _option) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const warehouse = getWarehouse(ctx, divisionName, cityName);
      const material = getMaterial(ctx, divisionName, cityName, materialName);
      const option = helpers.string(ctx, "option", _option);
      if (!hasUnlockUpgrade("Smart Supply"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not purchased the Smart Supply upgrade!`);
      SetSmartSupplyOption(warehouse, material, option);
    },
    buyMaterial: (ctx) => (_divisionName, _cityName, _materialName, _amt) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const amt = helpers.positiveInteger(ctx, "amt", _amt);
      const material = getMaterial(ctx, divisionName, cityName, materialName);
      BuyMaterial(material, amt);
    },
    bulkPurchase: (ctx) => (_divisionName, _cityName, _materialName, _amt) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const corporation = getCorporation();
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const amt = helpers.number(ctx, "amt", _amt);
      const warehouse = getWarehouse(ctx, divisionName, cityName);
      const material = getMaterial(ctx, divisionName, cityName, materialName);
      BulkPurchase(corporation, warehouse, material, amt);
    },
    makeProduct: (ctx) => (_divisionName, _cityName, _productName, _designInvest, _marketingInvest) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const productName = helpers.string(ctx, "productName", _productName);
      const designInvest = helpers.number(ctx, "designInvest", _designInvest);
      const marketingInvest = helpers.number(ctx, "marketingInvest", _marketingInvest);
      const corporation = getCorporation();
      MakeProduct(corporation, getDivision(divisionName), cityName, productName, designInvest, marketingInvest);
    },
    limitProductProduction: (ctx) => (_divisionName, _cityName, _productName, _qty) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const productName = helpers.string(ctx, "productName", _productName);
      const qty = helpers.number(ctx, "qty", _qty);
      LimitProductProduction(getProduct(divisionName, productName), cityName, qty);
    },
    exportMaterial: (ctx) => (_sourceDivision, _sourceCity, _targetDivision, _targetCity, _materialName, _amt) => {
      checkAccess(ctx, 7);
      const sourceDivision = helpers.string(ctx, "sourceDivision", _sourceDivision);
      const sourceCity = getEnumHelper(CityName).nsGetMember(ctx, "sourceCity", _sourceCity);
      const targetDivision = helpers.string(ctx, "targetDivision", _targetDivision);
      const targetCity = getEnumHelper(CityName).nsGetMember(ctx, "targetCity", _targetCity);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const amt = helpers.string(ctx, "amt", _amt);
      ExportMaterial(
        targetDivision,
        targetCity,
        getMaterial(ctx, sourceDivision, sourceCity, materialName),
        amt,
        getDivision(targetDivision),
      );
    },
    cancelExportMaterial:
      (ctx) => (_sourceDivision, _sourceCity, _targetDivision, _targetCity, _materialName, _amt) => {
        checkAccess(ctx, 7);
        const sourceDivision = helpers.string(ctx, "sourceDivision", _sourceDivision);
        const sourceCity = getEnumHelper(CityName).nsGetMember(ctx, "sourceCity", _sourceCity);
        const targetDivision = helpers.string(ctx, "targetDivision", _targetDivision);
        const targetCity = getEnumHelper(CityName).nsGetMember(ctx, "targetCity", _targetCity);
        const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
        const amt = helpers.string(ctx, "amt", _amt);
        CancelExportMaterial(
          targetDivision,
          targetCity,
          getMaterial(ctx, sourceDivision, sourceCity, materialName),
          amt,
        );
      },
    limitMaterialProduction: (ctx) => (_divisionName, _cityName, _materialName, _qty) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const qty = helpers.number(ctx, "qty", _qty);
      LimitMaterialProduction(getMaterial(ctx, divisionName, cityName, materialName), qty);
    },
    setMaterialMarketTA1: (ctx) => (_divisionName, _cityName, _materialName, _on) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const on = !!_on;
      if (!getDivision(divisionName).hasResearch("Market-TA.I"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not researched MarketTA.I for division: ${divisionName}`);
      SetMaterialMarketTA1(getMaterial(ctx, divisionName, cityName, materialName), on);
    },
    setMaterialMarketTA2: (ctx) => (_divisionName, _cityName, _materialName, _on) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      const on = !!_on;
      if (!getDivision(divisionName).hasResearch("Market-TA.II"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not researched MarketTA.II for division: ${divisionName}`);
      SetMaterialMarketTA2(getMaterial(ctx, divisionName, cityName, materialName), on);
    },
    setProductMarketTA1: (ctx) => (_divisionName, _productName, _on) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const productName = helpers.string(ctx, "productName", _productName);
      const on = !!_on;
      if (!getDivision(divisionName).hasResearch("Market-TA.I"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not researched MarketTA.I for division: ${divisionName}`);
      SetProductMarketTA1(getProduct(divisionName, productName), on);
    },
    setProductMarketTA2: (ctx) => (_divisionName, _productName, _on) => {
      checkAccess(ctx, 7);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const productName = helpers.string(ctx, "productName", _productName);
      const on = !!_on;
      if (!getDivision(divisionName).hasResearch("Market-TA.II"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not researched MarketTA.II for division: ${divisionName}`);
      SetProductMarketTA2(getProduct(divisionName, productName), on);
    },
  };

  const officeAPI: InternalAPI<OfficeAPI> = {
    getHireAdVertCost: (ctx) => (_divisionName) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const division = getDivision(divisionName);
      return division.getAdVertCost();
    },
    getHireAdVertCount: (ctx) => (_divisionName) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const division = getDivision(divisionName);
      return division.numAdVerts;
    },
    getResearchCost: (ctx) => (_divisionName, _researchName) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const researchName = getEnumHelper(allResearch).nsGetMember(ctx, "researchName", _researchName);
      return getResearchCost(getDivision(divisionName), researchName);
    },
    hasResearched: (ctx) => (_divisionName, _researchName) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const researchName = getEnumHelper(allResearch).nsGetMember(ctx, "researchName", _researchName);
      return hasResearched(getDivision(divisionName), researchName);
    },
    getOfficeSizeUpgradeCost: (ctx) => (_divisionName, _cityName, _size) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const size = helpers.positiveInteger(ctx, "size", _size);
      const office = getOffice(ctx, divisionName, cityName);
      const initialPriceMult = Math.round(office.size / corpConstants.officeInitialSize);
      const costMultiplier = 1.09;
      let mult = 0;
      for (let i = 0; i < size / corpConstants.officeInitialSize; ++i) {
        mult += Math.pow(costMultiplier, initialPriceMult + i);
      }
      return corpConstants.officeInitialCost * mult;
    },
    setAutoJobAssignment: (ctx) => (_divisionName, _cityName, _job, _amount) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const amount = helpers.positiveInteger(ctx, "amount", _amount);
      const job = getEnumHelper(EmployeePosition).nsGetMember(ctx, "job", _job);

      if (job === EmployeePosition.Unassigned) return false;

      const office = getOffice(ctx, divisionName, cityName);
      const totalNewEmployees = amount - office.employeeNextJobs[job];

      if (office.employeeNextJobs[EmployeePosition.Unassigned] < totalNewEmployees)
        throw helpers.makeRuntimeErrorMsg(
          ctx,
          `Unable to bring '${job} employees to ${amount}. Requires ${totalNewEmployees} unassigned employees`,
        );
      return office.autoAssignJob(job, amount);
    },
    hireEmployee: (ctx) => (_divisionName, _cityName, _job) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const job = getEnumHelper(EmployeePosition).nsGetMember(ctx, "job", _job ?? EmployeePosition.Unassigned);
      const office = getOffice(ctx, divisionName, cityName);
      return office.hireRandomEmployee(job);
    },
    upgradeOfficeSize: (ctx) => (_divisionName, _cityName, _size) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const size = helpers.positiveInteger(ctx, "size", _size);
      const office = getOffice(ctx, divisionName, cityName);
      const corporation = getCorporation();
      UpgradeOfficeSize(corporation, office, size);
    },
    throwParty: (ctx) => (_divisionName, _cityName, _costPerEmployee) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const costPerEmployee = helpers.number(ctx, "costPerEmployee", _costPerEmployee);

      if (costPerEmployee < 0) {
        throw new Error("Invalid value for Cost Per Employee field! Must be numeric and greater than 0");
      }
      const corporation = getCorporation();
      const office = getOffice(ctx, divisionName, cityName);

      return ThrowParty(corporation, office, costPerEmployee);
    },
    buyTea: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);

      const corporation = getCorporation();
      const office = getOffice(ctx, divisionName, cityName);
      return BuyTea(corporation, office);
    },
    hireAdVert: (ctx) => (_divisionName) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const corporation = getCorporation();
      HireAdVert(corporation, getDivision(divisionName));
    },
    research: (ctx) => (_divisionName, _researchName) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const researchName = getEnumHelper(allResearch).nsGetMember(ctx, "researchName", _researchName);
      Research(getDivision(divisionName), researchName);
    },
    getOffice: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, 8);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const office = getOffice(ctx, divisionName, cityName);
      return {
        loc: office.loc,
        size: office.size,
        maxEne: office.maxEne,
        maxMor: office.maxMor,
        employees: office.totalEmployees,
        avgEne: office.avgEne,
        avgMor: office.avgMor,
        totalExperience: office.totalExp,
        employeeProd: Object.assign({}, office.employeeProd),
        employeeJobs: Object.assign({}, office.employeeJobs),
      };
    },
  };

  const corpFunctions: InternalAPI<NSCorporation> = {
    ...warehouseAPI,
    ...officeAPI,
    hasCorporation: () => () => !!Player.corporation,
    getConstants: (ctx) => () => {
      checkAccess(ctx);
      /* TODO 2.2: possibly just rework the whole corp constants structure to be more readable, and just use cloneDeep
       *           to provide it directly to player.
       * TODO 2.2: Roll product information into industriesData, there's no reason to look up a product separately */
      return cloneDeep(omit(corpConstants, "fundingRoundShares", "fundingRoundMultiplier", "valuationLength"));
      // TODO: add functions for getting materialInfo and research info
    },
    getIndustryData: (ctx) => (_industryName) => {
      checkAccess(ctx);
      const industryName = getEnumHelper(IndustryType).nsGetMember(ctx, "industryName", _industryName);
      return cloneDeep(IndustriesData[industryName]);
    },
    getMaterialData: (ctx) => (_materialName) => {
      checkAccess(ctx);
      const materialName = getEnumHelper(MaterialName).nsGetMember(ctx, "materialName", _materialName);
      return cloneDeep(MaterialInfo[materialName]);
    },
    expandIndustry: (ctx) => (_industryName, _divisionName) => {
      checkAccess(ctx);
      const industryName = getEnumHelper(IndustryType).nsGetMember(ctx, "industryName", _industryName);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const corporation = getCorporation();
      NewIndustry(corporation, industryName, divisionName);
    },
    expandCity: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper(CityName).nsGetMember(ctx, "cityName", _cityName);
      const corporation = getCorporation();
      const division = getDivision(divisionName);
      NewCity(corporation, division, cityName);
    },
    unlockUpgrade: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = helpers.string(ctx, "upgradeName", _upgradeName);
      const corporation = getCorporation();
      const upgrade = Object.values(CorporationUnlockUpgrades).find((upgrade) => upgrade.name === upgradeName);
      if (upgrade === undefined) throw new Error(`No upgrade named '${upgradeName}'`);
      UnlockUpgrade(corporation, upgrade);
    },
    levelUpgrade: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = helpers.string(ctx, "upgradeName", _upgradeName);
      const corporation = getCorporation();
      const upgrade = Object.values(CorporationUpgrades).find((upgrade) => upgrade.name === upgradeName);
      if (upgrade === undefined) throw new Error(`No upgrade named '${upgradeName}'`);
      LevelUpgrade(corporation, upgrade, 1);
    },
    issueDividends: (ctx) => (_rate) => {
      checkAccess(ctx);
      const rate = helpers.number(ctx, "rate", _rate);
      const max = corpConstants.dividendMaxRate;
      if (rate < 0 || rate > max)
        throw new Error(`Invalid value for rate field! Must be numeric, greater than 0, and less than ${max}`);
      const corporation = getCorporation();
      if (!corporation.public) throw helpers.makeRuntimeErrorMsg(ctx, `Your company has not gone public!`);
      IssueDividends(corporation, rate);
    },
    issueNewShares: (ctx) => (_amount) => {
      checkAccess(ctx);
      const corporation = getCorporation();
      const maxNewShares = corporation.calculateMaxNewShares();
      if (_amount == undefined) _amount = maxNewShares;
      const amount = helpers.number(ctx, "amount", _amount);
      if (corporation.issueNewSharesCooldown > 0) throw new Error(`Can't issue new shares, action on cooldown.`);
      if (amount < 10e6 || amount > maxNewShares)
        throw new Error(
          `Invalid value for amount field! Must be numeric, greater than 10m, and less than ${maxNewShares} (20% of total shares)`,
        );
      if (!corporation.public) throw helpers.makeRuntimeErrorMsg(ctx, `Your company has not gone public!`);
      const [funds] = IssueNewShares(corporation, amount);
      return funds;
    },
    getDivision: (ctx) => (_divisionName) => {
      checkAccess(ctx);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const division = getDivision(divisionName);
      return getSafeDivision(division);
    },
    getCorporation: (ctx) => () => {
      checkAccess(ctx);
      const corporation = getCorporation();
      return {
        name: corporation.name,
        funds: corporation.funds,
        revenue: corporation.revenue,
        expenses: corporation.expenses,
        public: corporation.public,
        totalShares: corporation.totalShares,
        numShares: corporation.numShares,
        shareSaleCooldown: corporation.shareSaleCooldown,
        issuedShares: corporation.issuedShares,
        sharePrice: corporation.sharePrice,
        dividendRate: corporation.dividendRate,
        dividendTax: corporation.dividendTax,
        dividendEarnings: corporation.getCycleDividends() / corpConstants.secondsPerMarketCycle,
        state: corporation.state.getState(),
        divisions: corporation.divisions.map((division) => division.name),
      };
    },
    createCorporation:
      (ctx) =>
      (_corporationName, _selfFund = true): boolean => {
        const corporationName = helpers.string(ctx, "corporationName", _corporationName);
        const selfFund = !!_selfFund;
        return createCorporation(corporationName, selfFund);
      },
    hasUnlockUpgrade: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = helpers.string(ctx, "upgradeName", _upgradeName);
      return hasUnlockUpgrade(upgradeName);
    },
    getUnlockUpgradeCost: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = helpers.string(ctx, "upgradeName", _upgradeName);
      return getUnlockUpgradeCost(upgradeName);
    },
    getUpgradeLevel: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = helpers.string(ctx, "upgradeName", _upgradeName);
      return getUpgradeLevel(ctx, upgradeName);
    },
    getUpgradeLevelCost: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = helpers.string(ctx, "upgradeName", _upgradeName);
      return getUpgradeLevelCost(ctx, upgradeName);
    },
    getInvestmentOffer: (ctx) => () => {
      checkAccess(ctx);
      return getInvestmentOffer();
    },
    acceptInvestmentOffer: (ctx) => () => {
      checkAccess(ctx);
      return acceptInvestmentOffer();
    },
    goPublic: (ctx) => (_numShares) => {
      checkAccess(ctx);
      const corporation = getCorporation();
      if (corporation.public) throw helpers.makeRuntimeErrorMsg(ctx, "corporation is already public");
      const numShares = helpers.number(ctx, "numShares", _numShares);
      return goPublic(numShares);
    },
    sellShares: (ctx) => (_numShares) => {
      checkAccess(ctx);
      const numShares = helpers.number(ctx, "numShares", _numShares);
      return SellShares(getCorporation(), numShares);
    },
    buyBackShares: (ctx) => (_numShares) => {
      checkAccess(ctx);
      const numShares = helpers.number(ctx, "numShares", _numShares);
      return BuyBackShares(getCorporation(), numShares);
    },
    bribe: (ctx) => (_factionName, _amountCash) => {
      checkAccess(ctx);
      const factionName = getEnumHelper(FactionName).nsGetMember(ctx, "factionName", _factionName);
      const amountCash = helpers.positiveInteger(ctx, "amountCash", _amountCash);
      return bribe(factionName, amountCash);
    },
    getBonusTime: (ctx) => () => {
      checkAccess(ctx);
      return Math.round(getCorporation().storedCycles / 5) * 1000;
    },
  };

  // TODO 3.0: Remove these removedFunctions warnings.
  Object.assign(corpFunctions, {
    assignJob: removedFunction(
      "v2.2.0",
      "Removed due to employees no longer being objects. Use ns.corporation.setAutoJobAssignment instead.",
      true,
    ),
    getEmployee: removedFunction("v2.2.0", "Removed due to employees no longer being individual objects.", true),
    getExpandCityCost: removedFunction("v2.2.0", "corporation.getConstants().officeInitialCost"),
    getExpandIndustryCost: removedFunction("v2.2.0", "corporation.getIndustryData"),
    getIndustryTypes: removedFunction("v2.2.0", "corporation.getConstants().industryNames"),
    getMaterialNames: removedFunction("v2.2.0", "corporation.getConstants().materialNames"),
    getPurchaseWarehouseCost: removedFunction("v2.2.0", "corporation.getConstants().warehouseInitialCost"),
    getResearchNames: removedFunction("v2.2.0", "corporation.getConstants().researchNames"),
    getUnlockables: removedFunction("v2.2.0", "corporation.getConstants().unlockNames"),
    getUpgradeNames: removedFunction("v2.2.0", "corporation.getConstants().upgradeNames"),
  });
  return corpFunctions;
}
