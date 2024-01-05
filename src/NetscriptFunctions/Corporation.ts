import { Player, Player as player } from "../Player";

import { OfficeSpace } from "../Corporation/OfficeSpace";
import { Product } from "../Corporation/Product";
import { Material } from "../Corporation/Material";
import { Warehouse } from "../Corporation/Warehouse";
import { Division } from "../Corporation/Division";
import { Corporation, CorporationResolvers } from "../Corporation/Corporation";
import { cloneDeep, omit } from "lodash";
import { setDeprecatedProperties } from "../utils/DeprecationHelper";
import {
  Corporation as NSCorporation,
  Division as NSDivision,
  WarehouseAPI,
  OfficeAPI,
  CorpResearchName,
  CorpMaterialName,
  CorpStateName,
} from "@nsdefs";

import {
  NewDivision,
  purchaseOffice,
  IssueDividends,
  GoPublic,
  IssueNewShares,
  AcceptInvestmentOffer,
  SellMaterial,
  SellProduct,
  SetSmartSupply,
  BuyMaterial,
  UpgradeOfficeSize,
  purchaseWarehouse,
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
import { CorpUnlocks } from "../Corporation/data/CorporationUnlocks";
import { CorpUpgrades } from "../Corporation/data/CorporationUpgrades";
import { CorpUnlockName, CorpUpgradeName, CorpEmployeeJob, CityName, FactionName } from "@enums";
import { IndustriesData, IndustryResearchTrees } from "../Corporation/data/IndustryData";
import * as corpConstants from "../Corporation/data/Constants";
import { ResearchMap } from "../Corporation/ResearchMap";
import { Factions } from "../Faction/Factions";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { InternalAPI, NetscriptContext, setRemovedFunctions } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { MaterialInfo } from "../Corporation/MaterialInfo";
import { calculateUpgradeCost } from "../Corporation/helpers";
import { PositiveInteger } from "../types";
import { getRecordKeys } from "../Types/Record";

export function NetscriptCorporation(): InternalAPI<NSCorporation> {
  function createCorporation(corporationName: string, selfFund = true): boolean {
    if (!player.canAccessCorporation() || player.corporation) return false;
    if (!corporationName) return false;
    if (player.bitNodeN !== 3 && !selfFund) throw new Error("cannot use seed funds outside of BitNode 3");
    if (currentNodeMults.CorporationSoftcap < 0.15)
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

  function hasUnlock(unlockName: CorpUnlockName): boolean {
    const corporation = getCorporation();
    return corporation.unlocks.has(unlockName);
  }

  function getUnlockCost(unlockName: CorpUnlockName): number {
    return CorpUnlocks[unlockName].price;
  }

  function getUpgradeLevel(upgradeName: CorpUpgradeName): number {
    const corporation = getCorporation();
    return corporation.upgrades[upgradeName].level;
  }

  function getUpgradeLevelCost(upgradeName: CorpUpgradeName): number {
    const corporation = getCorporation();
    const cost = calculateUpgradeCost(corporation, CorpUpgrades[upgradeName], 1 as PositiveInteger);
    return cost;
  }

  function getResearchCost(division: Division, researchName: CorpResearchName): number {
    const researchTree = IndustryResearchTrees[division.type];
    if (researchTree === undefined) throw new Error(`No research tree for industry '${division.type}'`);
    const allResearch = researchTree.getAllNodes();
    if (!allResearch.includes(researchName)) throw new Error(`No research named '${researchName}'`);
    const research = ResearchMap[researchName];
    return research.cost;
  }

  function hasResearched(division: Division, researchName: CorpResearchName): boolean {
    return division.researched.has(researchName);
  }

  function bribe(factionName: FactionName, amountCash: number): boolean {
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
    corporation.loseFunds(amountCash, "bribery");

    return true;
  }

  function getCorporation(): Corporation {
    const corporation = player.corporation;
    if (corporation === null) throw new Error("cannot be called without a corporation");
    return corporation;
  }

  function getDivision(divisionName: string): Division {
    const corporation = getCorporation();
    const division = corporation.divisions.get(divisionName);
    if (division === undefined) throw new Error(`No division named '${divisionName}'`);
    return division;
  }

  function getOffice(divisionName: string, cityName: CityName): OfficeSpace {
    const division = getDivision(divisionName);
    const office = division.offices[cityName];
    if (!office) throw new Error(`${division.name} has not expanded to '${cityName}'`);
    return office;
  }

  function getWarehouse(divisionName: string, cityName: CityName): Warehouse {
    const division = getDivision(divisionName);
    const warehouse = division.warehouses[cityName];
    if (!warehouse) throw new Error(`${division.name} does not have a warehouse in '${cityName}'`);
    return warehouse;
  }

  function getMaterial(divisionName: string, cityName: CityName, materialName: CorpMaterialName): Material {
    const warehouse = getWarehouse(divisionName, cityName);
    const material = warehouse.materials[materialName];
    return material;
  }

  function getProduct(divisionName: string, productName: string): Product {
    const division = getDivision(divisionName);
    const product = division.products.get(productName);
    if (product === undefined) throw new Error(`Invalid product name: '${productName}'`);
    return product;
  }

  function checkAccess(ctx: NetscriptContext, api?: CorpUnlockName): void {
    if (!player.corporation) throw helpers.makeRuntimeErrorMsg(ctx, "Must own a corporation.");
    if (!api) return;
    if (!player.corporation.unlocks.has(api)) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You do not have access to this API.");
    }
  }

  function getSafeDivision(division: Division): NSDivision {
    const cities = getRecordKeys(division.offices);

    return {
      name: division.name,
      type: division.type,
      awareness: division.awareness,
      popularity: division.popularity,
      productionMult: division.productionMult,
      researchPoints: division.researchPoints,
      lastCycleRevenue: division.lastCycleRevenue,
      lastCycleExpenses: division.lastCycleExpenses,
      thisCycleRevenue: division.thisCycleRevenue,
      thisCycleExpenses: division.thisCycleExpenses,
      numAdVerts: division.numAdVerts,
      cities: cities,
      products: [...division.products.keys()],
      makesProducts: division.makesProducts,
      maxProducts: division.maxProducts,
    };
  }

  const warehouseAPI: InternalAPI<WarehouseAPI> = {
    getUpgradeWarehouseCost:
      (ctx) =>
      (_divisionName, _cityName, _amt = 1) => {
        checkAccess(ctx, CorpUnlockName.WarehouseAPI);
        const divisionName = helpers.string(ctx, "divisionName", _divisionName);
        const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
        const amt = helpers.number(ctx, "amount", _amt);
        if (amt < 1) {
          throw helpers.makeRuntimeErrorMsg(ctx, "You must provide a positive number");
        }
        const warehouse = getWarehouse(divisionName, cityName);
        return UpgradeWarehouseCost(warehouse, amt);
      },
    hasWarehouse: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const division = getDivision(divisionName);
      return cityName in division.warehouses;
    },
    getWarehouse: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const warehouse = getWarehouse(divisionName, cityName);
      return {
        level: warehouse.level,
        city: warehouse.city,
        size: warehouse.size,
        sizeUsed: warehouse.sizeUsed,
        smartSupplyEnabled: warehouse.smartSupplyEnabled,
      };
    },
    getMaterial: (ctx) => (_divisionName, _cityName, _materialName) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      const material = getMaterial(divisionName, cityName, materialName);
      const corporation = getCorporation();
      const exports = cloneDeep(material.exports);
      return {
        marketPrice: material.marketPrice,
        desiredSellPrice: material.desiredSellPrice,
        desiredSellAmount: material.desiredSellAmount,
        name: material.name,
        stored: material.stored,
        quality: material.quality,
        demand: corporation.unlocks.has(CorpUnlockName.MarketResearchDemand) ? material.demand : undefined,
        competition: corporation.unlocks.has(CorpUnlockName.MarketDataCompetition) ? material.competition : undefined,
        productionAmount: material.productionAmount,
        actualSellAmount: material.actualSellAmount,
        exports: exports,
      };
    },
    getProduct: (ctx) => (_divisionName, _cityName, _productName) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const productName = helpers.string(ctx, "productName", _productName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const product = getProduct(divisionName, productName);
      const corporation = getCorporation();
      const cityData = product.cityData[cityName];
      return {
        name: product.name,
        demand: corporation.unlocks.has(CorpUnlockName.MarketResearchDemand) ? product.demand : undefined,
        competition: corporation.unlocks.has(CorpUnlockName.MarketDataCompetition) ? product.competition : undefined,
        rating: product.rating,
        effectiveRating: cityData.effectiveRating,
        stats: cloneDeep(product.stats),
        productionCost: cityData.productionCost,
        desiredSellPrice: cityData.desiredSellPrice,
        desiredSellAmount: cityData.desiredSellAmount,
        stored: cityData.stored,
        productionAmount: cityData.productionAmount,
        actualSellAmount: cityData.actualSellAmount,
        developmentProgress: product.developmentProgress,
        advertisingInvestment: product.advertisingInvestment,
        designInvestment: product.designInvestment,
        size: product.size,
      };
    },
    purchaseWarehouse: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const corporation = getCorporation();
      purchaseWarehouse(corporation, getDivision(divisionName), cityName);
    },
    upgradeWarehouse:
      (ctx) =>
      (_divisionName, _cityName, _amt = 1): void => {
        checkAccess(ctx, CorpUnlockName.WarehouseAPI);
        const divisionName = helpers.string(ctx, "divisionName", _divisionName);
        const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
        const amt = helpers.number(ctx, "amount", _amt);
        const corporation = getCorporation();
        if (amt < 1) {
          throw helpers.makeRuntimeErrorMsg(ctx, "You must provide a positive number");
        }
        UpgradeWarehouse(corporation, getDivision(divisionName), getWarehouse(divisionName, cityName), amt);
      },
    sellMaterial: (ctx) => (_divisionName, _cityName, _materialName, _amt, _price) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      const amt = helpers.string(ctx, "amt", _amt);
      const price = helpers.string(ctx, "price", _price);
      const material = getMaterial(divisionName, cityName, materialName);
      SellMaterial(material, amt, price);
    },
    sellProduct:
      (ctx) =>
      (_divisionName, _cityName, _productName, _amt, _price, _all): void => {
        checkAccess(ctx, CorpUnlockName.WarehouseAPI);
        const divisionName = helpers.string(ctx, "divisionName", _divisionName);
        const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
        const productName = helpers.string(ctx, "productName", _productName);
        const amt = helpers.string(ctx, "amt", _amt);
        const price = helpers.string(ctx, "price", _price);
        const all = !!_all;
        const product = getProduct(divisionName, productName);
        SellProduct(product, cityName, amt, price, all);
      },
    discontinueProduct: (ctx) => (_divisionName, _productName) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const productName = helpers.string(ctx, "productName", _productName);
      getDivision(divisionName).discontinueProduct(productName);
    },
    setSmartSupply: (ctx) => (_divisionName, _cityName, _enabled) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const enabled = !!_enabled;
      const warehouse = getWarehouse(divisionName, cityName);
      if (!hasUnlock(CorpUnlockName.SmartSupply))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not purchased the Smart Supply upgrade!`);
      SetSmartSupply(warehouse, enabled);
    },
    setSmartSupplyOption: (ctx) => (_divisionName, _cityName, _materialName, _option) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      const warehouse = getWarehouse(divisionName, cityName);
      const material = getMaterial(divisionName, cityName, materialName);
      const option = getEnumHelper("SmartSupplyOption").nsGetMember(ctx, _option);
      if (!hasUnlock(CorpUnlockName.SmartSupply))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not purchased the Smart Supply upgrade!`);
      SetSmartSupplyOption(warehouse, material, option);
    },
    buyMaterial: (ctx) => (_divisionName, _cityName, _materialName, _amt) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const division = getCorporation().divisions.get(divisionName);
      if (!division) throw helpers.makeRuntimeErrorMsg(ctx, `No division with provided name ${divisionName}`);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      const amt = helpers.number(ctx, "amt", _amt);
      if (amt < 0 || !Number.isFinite(amt))
        throw new Error("Invalid value for amount field! Must be numeric and greater than 0");
      const material = getMaterial(divisionName, cityName, materialName);
      BuyMaterial(division, material, amt);
    },
    bulkPurchase: (ctx) => (_divisionName, _cityName, _materialName, _amt) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const division = getCorporation().divisions.get(divisionName);
      if (!division) throw helpers.makeRuntimeErrorMsg(ctx, `No division with provided name ${divisionName}`);
      const corporation = getCorporation();
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      const amt = helpers.number(ctx, "amt", _amt);
      const warehouse = getWarehouse(divisionName, cityName);
      const material = getMaterial(divisionName, cityName, materialName);
      BulkPurchase(corporation, division, warehouse, material, amt);
    },
    makeProduct:
      (ctx) =>
      (_divisionName, _cityName, _productName, _designInvest, _marketingInvest): void => {
        checkAccess(ctx, CorpUnlockName.WarehouseAPI);
        const divisionName = helpers.string(ctx, "divisionName", _divisionName);
        const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
        const productName = helpers.string(ctx, "productName", _productName);
        const designInvest = helpers.number(ctx, "designInvest", _designInvest);
        const marketingInvest = helpers.number(ctx, "marketingInvest", _marketingInvest);
        const corporation = getCorporation();
        MakeProduct(corporation, getDivision(divisionName), cityName, productName, designInvest, marketingInvest);
      },
    limitProductProduction: (ctx) => (_divisionName, _cityName, _productName, _qty) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const productName = helpers.string(ctx, "productName", _productName);
      const qty = helpers.number(ctx, "qty", _qty);
      LimitProductProduction(getProduct(divisionName, productName), cityName, qty);
    },
    exportMaterial:
      (ctx) =>
      (_sourceDivision, _sourceCity, _targetDivision, _targetCity, _materialName, _amt): void => {
        checkAccess(ctx, CorpUnlockName.WarehouseAPI);
        const sourceDivision = helpers.string(ctx, "sourceDivision", _sourceDivision);
        const sourceCity = getEnumHelper("CityName").nsGetMember(ctx, _sourceCity, "sourceCity");
        const targetDivision = getDivision(helpers.string(ctx, "targetDivision", _targetDivision));
        const targetCity = getEnumHelper("CityName").nsGetMember(ctx, _targetCity, "targetCity");
        const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
        const amt = helpers.string(ctx, "amt", _amt);

        ExportMaterial(targetDivision, targetCity, getMaterial(sourceDivision, sourceCity, materialName), amt);
      },
    cancelExportMaterial:
      (ctx) =>
      (_sourceDivision, _sourceCity, _targetDivision, _targetCity, _materialName): void => {
        checkAccess(ctx, CorpUnlockName.WarehouseAPI);
        const sourceDivision = helpers.string(ctx, "sourceDivision", _sourceDivision);
        const sourceCity = getEnumHelper("CityName").nsGetMember(ctx, _sourceCity, "sourceCity");
        const targetDivision = helpers.string(ctx, "targetDivision", _targetDivision);
        const targetCity = getEnumHelper("CityName").nsGetMember(ctx, _targetCity, "targetCity");
        const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
        CancelExportMaterial(targetDivision, targetCity, getMaterial(sourceDivision, sourceCity, materialName));
      },
    limitMaterialProduction: (ctx) => (_divisionName, _cityName, _materialName, _qty) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      const qty = helpers.number(ctx, "qty", _qty);
      LimitMaterialProduction(getMaterial(divisionName, cityName, materialName), qty);
    },
    setMaterialMarketTA1: (ctx) => (_divisionName, _cityName, _materialName, _on) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      const on = !!_on;
      if (!getDivision(divisionName).hasResearch("Market-TA.I"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not researched MarketTA.I for division: ${divisionName}`);
      SetMaterialMarketTA1(getMaterial(divisionName, cityName, materialName), on);
    },
    setMaterialMarketTA2: (ctx) => (_divisionName, _cityName, _materialName, _on) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      const on = !!_on;
      if (!getDivision(divisionName).hasResearch("Market-TA.II"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not researched MarketTA.II for division: ${divisionName}`);
      SetMaterialMarketTA2(getMaterial(divisionName, cityName, materialName), on);
    },
    setProductMarketTA1: (ctx) => (_divisionName, _productName, _on) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const productName = helpers.string(ctx, "productName", _productName);
      const on = !!_on;
      if (!getDivision(divisionName).hasResearch("Market-TA.I"))
        throw helpers.makeRuntimeErrorMsg(ctx, `You have not researched MarketTA.I for division: ${divisionName}`);
      SetProductMarketTA1(getProduct(divisionName, productName), on);
    },
    setProductMarketTA2: (ctx) => (_divisionName, _productName, _on) => {
      checkAccess(ctx, CorpUnlockName.WarehouseAPI);
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
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const division = getDivision(divisionName);
      return division.getAdVertCost();
    },
    getHireAdVertCount: (ctx) => (_divisionName) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const division = getDivision(divisionName);
      return division.numAdVerts;
    },
    getResearchCost: (ctx) => (_divisionName, _researchName) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const researchName = getEnumHelper("CorpResearchName").nsGetMember(ctx, _researchName, "researchName");
      return getResearchCost(getDivision(divisionName), researchName);
    },
    hasResearched: (ctx) => (_divisionName, _researchName) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const researchName = getEnumHelper("CorpResearchName").nsGetMember(ctx, _researchName, "researchName");
      return hasResearched(getDivision(divisionName), researchName);
    },
    getOfficeSizeUpgradeCost: (ctx) => (_divisionName, _cityName, _size) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const size = helpers.number(ctx, "size", _size);
      if (size < 0) throw new Error("Invalid value for size field! Must be numeric and greater than 0");
      const office = getOffice(divisionName, cityName);
      const initialPriceMult = Math.round(office.size / corpConstants.officeInitialSize);
      const costMultiplier = 1.09;
      let mult = 0;
      for (let i = 0; i < size / corpConstants.officeInitialSize; ++i) {
        mult += Math.pow(costMultiplier, initialPriceMult + i);
      }
      return corpConstants.officeInitialCost * mult;
    },
    setAutoJobAssignment: (ctx) => (_divisionName, _cityName, _job, _amount) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const amount = helpers.number(ctx, "amount", _amount);
      const job = getEnumHelper("CorpEmployeeJob").nsGetMember(ctx, _job, "job");

      if (job === CorpEmployeeJob.Unassigned) return false;
      if (amount < 0 || !Number.isInteger(amount))
        throw helpers.makeRuntimeErrorMsg(
          ctx,
          `Invalid value for amount! Must be an integer and greater than or be 0". Amount:'${amount}'`,
        );

      const office = getOffice(divisionName, cityName);

      const totalNewEmployees = amount - office.employeeNextJobs[job];

      if (office.employeeNextJobs[CorpEmployeeJob.Unassigned] < totalNewEmployees)
        throw helpers.makeRuntimeErrorMsg(
          ctx,
          `Unable to bring '${job} employees to ${amount}. Requires ${totalNewEmployees} unassigned employees`,
        );
      return office.autoAssignJob(job, amount);
    },
    hireEmployee: (ctx) => (_divisionName, _cityName, _position) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      _position ??= CorpEmployeeJob.Unassigned;
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const position = getEnumHelper("CorpEmployeeJob").nsGetMember(ctx, _position, "position");

      const office = getOffice(divisionName, cityName);
      return office.hireRandomEmployee(position);
    },
    upgradeOfficeSize: (ctx) => (_divisionName, _cityName, _size) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const size = helpers.number(ctx, "size", _size);
      if (size < 0) throw new Error("Invalid value for size field! Must be numeric and greater than 0");
      const office = getOffice(divisionName, cityName);
      const corporation = getCorporation();
      UpgradeOfficeSize(corporation, office, size);
    },
    throwParty: (ctx) => (_divisionName, _cityName, _costPerEmployee) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const costPerEmployee = helpers.number(ctx, "costPerEmployee", _costPerEmployee);

      if (costPerEmployee < 0) {
        throw new Error("Invalid value for Cost Per Employee field! Must be numeric and greater than 0");
      }
      const corporation = getCorporation();
      const office = getOffice(divisionName, cityName);

      return ThrowParty(corporation, office, costPerEmployee);
    },
    buyTea: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);

      const corporation = getCorporation();
      const office = getOffice(divisionName, cityName);
      return BuyTea(corporation, office);
    },
    hireAdVert: (ctx) => (_divisionName) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const corporation = getCorporation();
      HireAdVert(corporation, getDivision(divisionName));
    },
    research: (ctx) => (_divisionName, _researchName) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const researchName = getEnumHelper("CorpResearchName").nsGetMember(ctx, _researchName, "researchName");
      Research(getDivision(divisionName), researchName);
    },
    getOffice: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx, CorpUnlockName.OfficeAPI);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const office = getOffice(divisionName, cityName);
      return {
        city: office.city,
        size: office.size,
        maxEnergy: office.maxEnergy,
        maxMorale: office.maxMorale,
        numEmployees: office.numEmployees,
        avgEnergy: office.avgEnergy,
        avgMorale: office.avgMorale,
        totalExperience: office.totalExperience,
        employeeProductionByJob: Object.assign({}, office.employeeProductionByJob),
        employeeJobs: Object.assign({}, office.employeeJobs),
      };
    },
  };

  // TODO 2.2: Add removed function error dialogs for all the functions removed/replaced by getConstants.
  const corpFunctions: InternalAPI<NSCorporation> = {
    ...warehouseAPI,
    ...officeAPI,
    hasCorporation: () => () => !!Player.corporation,
    getConstants: (ctx) => () => {
      checkAccess(ctx);
      /* TODO 2.2: possibly just rework the whole corp constants structure to be more readable, and just use cloneDeep
       *           to provide it directly to player.
       * TODO 2.2: Roll product information into industriesData, there's no reason to look up a product separately */
      // TODO: add functions for getting materialInfo and research info
      return cloneDeep(omit(corpConstants, "fundingRoundShares", "fundingRoundMultiplier", "valuationLength"));
    },
    getIndustryData: (ctx) => (_industryName) => {
      checkAccess(ctx);
      const industryName = getEnumHelper("IndustryType").nsGetMember(ctx, _industryName, "industryName");
      return cloneDeep(IndustriesData[industryName]);
    },
    getMaterialData: (ctx) => (_materialName) => {
      checkAccess(ctx);
      const materialName = getEnumHelper("CorpMaterialName").nsGetMember(ctx, _materialName, "materialName");
      return cloneDeep(MaterialInfo[materialName]);
    },
    expandIndustry: (ctx) => (_industryName, _divisionName) => {
      checkAccess(ctx);
      const industryName = getEnumHelper("IndustryType").nsGetMember(ctx, _industryName, "industryName");
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const corporation = getCorporation();
      NewDivision(corporation, industryName, divisionName);
    },
    expandCity: (ctx) => (_divisionName, _cityName) => {
      checkAccess(ctx);
      const divisionName = helpers.string(ctx, "divisionName", _divisionName);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      const corporation = getCorporation();
      const division = getDivision(divisionName);
      purchaseOffice(corporation, division, cityName);
    },
    purchaseUnlock: (ctx) => (_unlockName) => {
      checkAccess(ctx);
      const unlockName = getEnumHelper("CorpUnlockName").nsGetMember(ctx, _unlockName, "unlockName");
      const corporation = getCorporation();
      const message = corporation.purchaseUnlock(unlockName);
      if (message) throw new Error(`Could not unlock ${unlockName}: ${message}`);
    },
    levelUpgrade: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = getEnumHelper("CorpUpgradeName").nsGetMember(ctx, _upgradeName, "upgradeName");
      const corporation = getCorporation();
      const message = corporation.purchaseUpgrade(upgradeName, 1);
      if (message) throw new Error(`Could not upgrade ${upgradeName}: ${message}`);
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
      const data = {
        name: corporation.name,
        funds: corporation.funds,
        revenue: corporation.revenue,
        expenses: corporation.expenses,
        public: corporation.public,
        totalShares: corporation.totalShares,
        numShares: corporation.numShares,
        shareSaleCooldown: corporation.shareSaleCooldown,
        investorShares: corporation.investorShares,
        issuedShares: corporation.issuedShares,
        issueNewSharesCooldown: corporation.issueNewSharesCooldown,
        sharePrice: corporation.sharePrice,
        dividendRate: corporation.dividendRate,
        dividendTax: corporation.dividendTax,
        dividendEarnings: corporation.getCycleDividends() / corpConstants.secondsPerMarketCycle,
        nextState: corporation.state.nextName,
        prevState: corporation.state.prevName,
        divisions: [...corporation.divisions.keys()],
      };
      setDeprecatedProperties(data, {
        state: {
          identifier: "ns.corporation.getCorporation().state",
          message: "Use ns.corporation.getCorporation().nextState instead.",
          value: corporation.state.nextName,
        },
      });
      return data;
    },
    createCorporation:
      (ctx) =>
      (_corporationName, _selfFund = true): boolean => {
        const corporationName = helpers.string(ctx, "corporationName", _corporationName);
        const selfFund = !!_selfFund;
        return createCorporation(corporationName, selfFund);
      },
    hasUnlock: (ctx) => (_unlockName) => {
      checkAccess(ctx);
      const unlockName = getEnumHelper("CorpUnlockName").nsGetMember(ctx, _unlockName, "unlockName");
      return hasUnlock(unlockName);
    },
    getUnlockCost: (ctx) => (_unlockName) => {
      checkAccess(ctx);
      const unlockName = getEnumHelper("CorpUnlockName").nsGetMember(ctx, _unlockName, "unlockName");
      return getUnlockCost(unlockName);
    },
    getUpgradeLevel: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = getEnumHelper("CorpUpgradeName").nsGetMember(ctx, _upgradeName, "upgradeName");
      return getUpgradeLevel(upgradeName);
    },
    getUpgradeLevelCost: (ctx) => (_upgradeName) => {
      checkAccess(ctx);
      const upgradeName = getEnumHelper("CorpUpgradeName").nsGetMember(ctx, _upgradeName, "upgradeName");
      return getUpgradeLevelCost(upgradeName);
    },
    getInvestmentOffer: (ctx) => () => {
      checkAccess(ctx);
      const corporation = getCorporation();
      return corporation.getInvestmentOffer();
    },
    acceptInvestmentOffer: (ctx) => () => {
      checkAccess(ctx);
      const corporation = getCorporation();
      try {
        AcceptInvestmentOffer(corporation);
        return true;
      } catch (err) {
        return false;
      }
    },
    goPublic: (ctx) => (_numShares) => {
      checkAccess(ctx);
      const corporation = getCorporation();
      if (corporation.public) throw helpers.makeRuntimeErrorMsg(ctx, "corporation is already public");
      const numShares = helpers.number(ctx, "numShares", _numShares);
      GoPublic(corporation, numShares);
      return true;
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
      const factionName = getEnumHelper("FactionName").nsGetMember(ctx, _factionName);
      const amountCash = helpers.number(ctx, "amountCash", _amountCash);
      return bribe(factionName, amountCash);
    },
    getBonusTime: (ctx) => () => {
      checkAccess(ctx);
      return Math.round(getCorporation().storedCycles / 5) * 1000;
    },
    nextUpdate: (ctx) => () => {
      checkAccess(ctx);
      return new Promise<CorpStateName>((res) => CorporationResolvers.push(res));
    },
  };

  // Removed functions
  setRemovedFunctions(corpFunctions, {
    assignJob: {
      version: "2.2.0",
      replacement: "Removed due to employees no longer being objects. Use ns.corporation.setAutoJobAssignment instead.",
      replaceMsg: true,
    },
    getEmployee: {
      version: "2.2.0",
      replacement: "Removed due to employees no longer being individual objects.",
      replaceMsg: true,
    },
    getExpandCityCost: { version: "2.2.0", replacement: "corporation.getConstants().officeInitialCost" },
    getExpandIndustryCost: { version: "2.2.0", replacement: "corporation.getIndustryData" },
    getIndustryTypes: { version: "2.2.0", replacement: "corporation.getConstants().industryNames" },
    getMaterialNames: { version: "2.2.0", replacement: "corporation.getConstants().materialNames" },
    getPurchaseWarehouseCost: { version: "2.2.0", replacement: "corporation.getConstants().warehouseInitialCost" },
    getResearchNames: { version: "2.2.0", replacement: "corporation.getConstants().researchNames" },
    getUnlockables: { version: "2.2.0", replacement: "corporation.getConstants().unlockNames" },
    getUpgradeNames: { version: "2.2.0", replacement: "corporation.getConstants().upgradeNames" },
  });
  return corpFunctions;
}
