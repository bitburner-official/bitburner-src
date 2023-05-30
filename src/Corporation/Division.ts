import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { CityName } from "../Enums";
import { IndustryResearchTrees, IndustriesData } from "./IndustryData";
import * as corpConstants from "./data/Constants";
import { CorpEmployeeJob, IndustryType } from "./data/Enums";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { calculateEffectWithFactors } from "../utils/calculateEffectWithFactors";
import { OfficeSpace } from "./OfficeSpace";
import { Product } from "./Product";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { isString } from "../utils/helpers/string";
import { MaterialInfo } from "./MaterialInfo";
import { Warehouse } from "./Warehouse";
import { Corporation } from "./Corporation";
import { CorpMaterialName, CorpResearchName, CorpStateName } from "@nsdefs";
import { JSONMap, JSONSet } from "../Types/Jsonable";
import { PartialRecord, getRecordEntries, getRecordKeys, getRecordValues } from "../Types/Record";
import { Material } from "./Material";
import { getKeyList } from "../utils/helpers/getKeyList";

interface DivisionParams {
  name: string;
  corp: Corporation;
  type: IndustryType;
}

export class Division {
  name = "DefaultDivisionName";
  type = IndustryType.Agriculture;
  researchPoints = 0;
  researched = new JSONSet<CorpResearchName>();
  requiredMaterials: PartialRecord<CorpMaterialName, number> = {};

  // Not included in save file. Just used for tracking whether research tree has been updated since game load.
  treeInitialized = false;

  //An array of the name of materials being produced
  producedMaterials: CorpMaterialName[] = [];

  products = new JSONMap<string, Product>();
  makesProducts = false;

  awareness = 0;
  popularity = 0;
  startingCost = 0;

  /* The following are factors for how much production/other things are increased by
       different factors. The production increase always has diminishing returns,
       and they are all represented by exponentials of < 1 (e.g x ^ 0.5, x ^ 0.8)
       The number for these represent the exponential. A lower number means more
       diminishing returns */
  realEstateFactor = 0;
  researchFactor = 0;
  hardwareFactor = 0;
  robotFactor = 0;
  aiCoreFactor = 0;
  advertisingFactor = 0;

  productionMult = 0; //Production multiplier

  //Financials
  lastCycleRevenue = 0;
  lastCycleExpenses = 0;
  thisCycleRevenue = 0;
  thisCycleExpenses = 0;

  state: CorpStateName = "START";
  newInd = true;

  // Sector 12 office and warehouse are added by default, these entries are added in the constructor.
  warehouses: PartialRecord<CityName, Warehouse> = {};
  offices: PartialRecord<CityName, OfficeSpace> = {};

  numAdVerts = 0;

  constructor(params: DivisionParams | null = null) {
    if (!params) return;
    // Must be initialized inside the constructor because it references the industry
    this.type = params.type;
    this.name = params.name;
    // Add default starting
    this.warehouses[CityName.Sector12] = new Warehouse({
      loc: CityName.Sector12,
      division: this,
      size: corpConstants.warehouseInitialSize,
    });
    this.offices[CityName.Sector12] = new OfficeSpace({
      city: CityName.Sector12,
      size: corpConstants.officeInitialSize,
    });

    // Loading data based on this division's industry type
    const data = IndustriesData[this.type];
    this.startingCost = data.startingCost;
    this.makesProducts = data.product ? true : false;
    this.realEstateFactor = data.realEstateFactor ?? 0;
    this.researchFactor = data.scienceFactor ?? 0;
    this.hardwareFactor = data.hardwareFactor ?? 0;
    this.robotFactor = data.robotFactor ?? 0;
    this.aiCoreFactor = data.aiCoreFactor ?? 0;
    this.advertisingFactor = data.advertisingFactor ?? 0;
    this.requiredMaterials = data.requiredMaterials;
    this.producedMaterials = data.producedMaterials ?? [];
  }

  getMaximumNumberProducts(): number {
    if (!this.makesProducts) return 0;

    // Calculate additional number of allowed Products from Research/Upgrades
    let additional = 0;
    if (this.hasResearch("uPgrade: Capacity.I")) ++additional;
    if (this.hasResearch("uPgrade: Capacity.II")) ++additional;

    return corpConstants.maxProductsBase + additional;
  }

  hasMaximumNumberProducts(): boolean {
    return this.products.size >= this.getMaximumNumberProducts();
  }

  //Calculates the values that factor into the production and properties of
  //materials/products (such as quality, etc.)
  calculateProductionFactors(): void {
    let multSum = 0;
    for (const warehouse of getRecordValues(this.warehouses)) {
      const materials = warehouse.materials;

      const cityMult =
        Math.pow(0.002 * materials["Real Estate"].stored + 1, this.realEstateFactor) *
        Math.pow(0.002 * materials.Hardware.stored + 1, this.hardwareFactor) *
        Math.pow(0.002 * materials.Robots.stored + 1, this.robotFactor) *
        Math.pow(0.002 * materials["AI Cores"].stored + 1, this.aiCoreFactor);
      multSum += Math.pow(cityMult, 0.73);
    }

    multSum < 1 ? (this.productionMult = 1) : (this.productionMult = multSum);
  }

  updateWarehouseSizeUsed(warehouse: Warehouse): void {
    warehouse.updateMaterialSizeUsed();

    for (const prod of this.products.values()) {
      warehouse.sizeUsed += prod.cityData[warehouse.city].stored * prod.size;
    }
  }

  process(marketCycles = 1, state: CorpStateName, corporation: Corporation): void {
    this.state = state;

    //At the start of a cycle, store and reset revenue/expenses
    //Then calculate salaries and process the markets
    if (state === "START") {
      if (isNaN(this.thisCycleRevenue) || isNaN(this.thisCycleExpenses)) {
        console.error("NaN in Corporation's computed revenue/expenses");
        dialogBoxCreate(
          "Something went wrong when compting Corporation's revenue/expenses. This is a bug. Please report to game developer",
        );
        this.thisCycleRevenue = 0;
        this.thisCycleExpenses = 0;
      }
      this.lastCycleRevenue = this.thisCycleRevenue / (marketCycles * corpConstants.secondsPerMarketCycle);
      this.lastCycleExpenses = this.thisCycleExpenses / (marketCycles * corpConstants.secondsPerMarketCycle);
      this.thisCycleRevenue = 0;
      this.thisCycleExpenses = 0;

      // Once you start making revenue, the player should no longer be
      // considered new, and therefore no longer needs the 'tutorial' UI elements
      if (this.lastCycleRevenue > 0) {
        this.newInd = false;
      }

      // Process offices (and the employees in them)
      let employeeSalary = 0;
      for (const officeLoc of Object.values(CityName)) {
        const office = this.offices[officeLoc];
        if (office) employeeSalary += office.process(marketCycles, corporation, this);
      }
      this.thisCycleExpenses = this.thisCycleExpenses + employeeSalary;

      // Process change in demand/competition of materials/products
      this.processMaterialMarket();
      this.processProductMarket(marketCycles);

      // Process loss of popularity
      this.popularity -= marketCycles * 0.0001;
      this.popularity = Math.max(0, this.popularity);

      // Process Dreamsense gains
      const popularityGain = corporation.getDreamSenseGain(),
        awarenessGain = popularityGain * 4;
      if (popularityGain > 0) {
        const awareness = this.awareness + awarenessGain * marketCycles;
        this.awareness = Math.min(awareness, Number.MAX_VALUE);

        const popularity = this.popularity + popularityGain * marketCycles;
        this.popularity = Math.min(popularity, Number.MAX_VALUE);
      }

      return;
    }

    // Process production, purchase, and import/export of materials
    let res = this.processMaterials(marketCycles, corporation);
    if (Array.isArray(res)) {
      this.thisCycleRevenue = this.thisCycleRevenue + res[0];
      this.thisCycleExpenses = this.thisCycleExpenses + res[1];
    }

    // Process creation, production & sale of products
    res = this.processProducts(marketCycles, corporation);
    if (Array.isArray(res)) {
      this.thisCycleRevenue = this.thisCycleRevenue + res[0];
      this.thisCycleExpenses = this.thisCycleExpenses + res[1];
    }
  }

  // Process change in demand and competition for this industry's materials
  processMaterialMarket(): void {
    //References to prodMats and reqMats
    const reqMats = this.requiredMaterials,
      prodMats = this.producedMaterials;

    //Only 'process the market' for materials that this industry deals with
    for (const city of Object.values(CityName)) {
      //If this industry has a warehouse in this city, process the market
      //for every material this industry requires or produces
      if (this.warehouses[city]) {
        const wh = this.warehouses[city] as Warehouse; // Warehouse type is known due to if check above
        for (const name of Object.keys(reqMats) as CorpMaterialName[]) {
          if (Object.hasOwn(reqMats, name)) {
            wh.materials[name].processMarket();
          }
        }

        //Produced materials are stored in an array
        for (const matName of prodMats) wh.materials[matName].processMarket();

        //Process these twice because these boost production ??????
        wh.materials.Hardware.processMarket();
        wh.materials.Robots.processMarket();
        wh.materials["AI Cores"].processMarket();
        wh.materials["Real Estate"].processMarket();
      }
    }
  }

  // Process change in demand and competition for this industry's products
  processProductMarket(marketCycles = 1): void {
    // Demand gradually decreases, and competition gradually increases
    for (const product of this.products.values()) {
      let change = getRandomInt(0, 3) * 0.0004;
      if (change === 0) continue;

      if (
        this.type === IndustryType.Pharmaceutical ||
        this.type === IndustryType.Software ||
        this.type === IndustryType.Robotics
      ) {
        change *= 3;
      }
      change *= marketCycles;
      product.demand -= change;
      product.competition += change;
      product.competition = Math.min(product.competition, 99.99);
      product.demand = Math.max(product.demand, 0.001);
    }
  }

  //Process production, purchase, and import/export of materials
  processMaterials(marketCycles = 1, corporation: Corporation): [number, number] {
    let revenue = 0;
    let expenses = 0;
    this.calculateProductionFactors();

    for (const [city, office] of getRecordEntries(this.offices)) {
      // Research points can be created even without a warehouse
      this.researchPoints +=
        // Todo: add constant for magic number
        0.004 *
        Math.pow(office.employeeProductionByJob[CorpEmployeeJob.RandD], 0.5) *
        corporation.getScientificResearchMult() *
        this.getScientificResearchMultiplier();

      // Employee pay is an expense even with no warehouse.
      expenses += office.totalSalary;

      const warehouse = this.warehouses[city];
      if (!warehouse) continue;

      switch (this.state) {
        case "PURCHASE": {
          const smartBuy: PartialRecord<CorpMaterialName, [buyAmt: number, reqMat: number]> = {};

          /* Process purchase of materials, not from smart supply */
          for (const [matName, mat] of getRecordEntries(warehouse.materials)) {
            const reqMat = this.requiredMaterials[matName];
            if (warehouse.smartSupplyEnabled && reqMat) {
              // Smart supply
              mat.buyAmount = reqMat * warehouse.smartSupplyStore;
              let buyAmt = mat.buyAmount * corpConstants.secondsPerMarketCycle * marketCycles;
              const maxAmt = Math.floor((warehouse.size - warehouse.sizeUsed) / MaterialInfo[matName].size);
              buyAmt = Math.min(buyAmt, maxAmt);
              if (buyAmt > 0) smartBuy[matName] = [buyAmt, reqMat];
            } else {
              // Not smart supply
              let buyAmt = 0;
              let maxAmt = 0;

              buyAmt = mat.buyAmount * corpConstants.secondsPerMarketCycle * marketCycles;

              maxAmt = Math.floor((warehouse.size - warehouse.sizeUsed) / MaterialInfo[matName].size);

              buyAmt = Math.min(buyAmt, maxAmt);
              if (buyAmt > 0) {
                mat.quality = Math.max(0.1, (mat.quality * mat.stored + 1 * buyAmt) / (mat.stored + buyAmt));
                mat.stored += buyAmt;
                expenses += buyAmt * mat.marketPrice;
              }
              this.updateWarehouseSizeUsed(warehouse);
            }
          } //End process purchase of materials

          // Find which material were trying to create the least amount of product with.
          let worseAmt = 1e99;
          for (const [buyAmt, reqMat] of Object.values(smartBuy)) {
            const amt = buyAmt / reqMat;
            if (amt < worseAmt) worseAmt = amt;
          }

          // Align all the materials to the smallest amount.
          for (const buyArray of Object.values(smartBuy)) {
            buyArray[0] = worseAmt * buyArray[1];
          }

          // Calculate the total size of all things were trying to buy
          let totalSize = 0;
          for (const [matName, [buyAmt]] of getRecordEntries(smartBuy)) {
            if (buyAmt === undefined) throw new Error(`Somehow smartbuy matname is undefined`);
            totalSize += buyAmt * MaterialInfo[matName].size;
          }

          // Shrink to the size of available space.
          const freeSpace = warehouse.size - warehouse.sizeUsed;
          if (totalSize > freeSpace) {
            // Multiplier applied to buy amounts to not overfill warehouse
            const buyMult = freeSpace / totalSize;
            for (const buyArray of Object.values(smartBuy)) {
              buyArray[0] = Math.floor(buyArray[0] * buyMult);
            }
          }

          // Use the materials already in the warehouse if the option is on.
          for (const [matName, buyArray] of getRecordEntries(smartBuy)) {
            if (warehouse.smartSupplyOptions[matName] === "none") continue;
            const mat = warehouse.materials[matName];
            if (warehouse.smartSupplyOptions[matName] === "leftovers") {
              buyArray[0] = Math.max(0, buyArray[0] - mat.stored);
            } else {
              buyArray[0] = Math.max(0, buyArray[0] - mat.importAmount);
            }
          }

          // buy them
          for (const [matName, [buyAmt]] of getRecordEntries(smartBuy)) {
            const mat = warehouse.materials[matName];
            if (mat.stored + buyAmt != 0) mat.quality = (mat.quality * mat.stored + 1 * buyAmt) / (mat.stored + buyAmt);
            else mat.quality = 1;
            mat.stored += buyAmt;
            mat.buyAmount = buyAmt / 10;
            expenses += buyAmt * mat.marketPrice;
          }
          break;
        }
        case "PRODUCTION":
          warehouse.smartSupplyStore = 0; //Reset smart supply amount

          /* Process production of materials */
          if (this.producedMaterials.length > 0) {
            const mat = warehouse.materials[this.producedMaterials[0]];
            //Calculate the maximum production of this material based
            //on the office's productivity
            const maxProd =
              this.getOfficeProductivity(office) *
              this.productionMult * // Multiplier from materials
              corporation.getProductionMultiplier() *
              this.getProductionMultiplier(); // Multiplier from Research
            let prod;

            // If there is a limit set on production, apply the limit
            prod = mat.productionLimit === null ? maxProd : Math.min(maxProd, mat.productionLimit);

            prod *= corpConstants.secondsPerMarketCycle * marketCycles; //Convert production from per second to per market cycle

            // Calculate net change in warehouse storage making the produced materials will cost
            let totalMatSize = 0;
            for (let tmp = 0; tmp < this.producedMaterials.length; ++tmp) {
              totalMatSize += MaterialInfo[this.producedMaterials[tmp]].size;
            }
            for (const [reqMatName, reqQty] of getRecordEntries(this.requiredMaterials)) {
              totalMatSize -= MaterialInfo[reqMatName].size * reqQty;
            }
            // If not enough space in warehouse, limit the amount of produced materials
            if (totalMatSize > 0) {
              const maxAmt = Math.floor((warehouse.size - warehouse.sizeUsed) / totalMatSize);
              prod = Math.min(maxAmt, prod);
            }

            if (prod < 0) {
              prod = 0;
            }

            // Keep track of production for smart supply (/s)
            warehouse.smartSupplyStore += prod / (corpConstants.secondsPerMarketCycle * marketCycles);

            // Make sure we have enough resource to make our materials
            let producableFrac = 1;
            for (const [reqMatName, reqMat] of getRecordEntries(this.requiredMaterials)) {
              const req = reqMat * prod;
              if (warehouse.materials[reqMatName].stored < req) {
                producableFrac = Math.min(producableFrac, warehouse.materials[reqMatName].stored / req);
              }
            }
            if (producableFrac <= 0) {
              producableFrac = 0;
              prod = 0;
            }

            // Make our materials if they are producable
            if (producableFrac > 0 && prod > 0) {
              const requiredMatsEntries = getRecordEntries(this.requiredMaterials);
              let avgQlt = 0;
              const divider = requiredMatsEntries.length;
              for (const [reqMatName, reqMat] of requiredMatsEntries) {
                const reqMatQtyNeeded = reqMat * prod * producableFrac;
                warehouse.materials[reqMatName].stored -= reqMatQtyNeeded;
                warehouse.materials[reqMatName].productionAmount = 0;
                warehouse.materials[reqMatName].productionAmount -=
                  reqMatQtyNeeded / (corpConstants.secondsPerMarketCycle * marketCycles);

                avgQlt += warehouse.materials[reqMatName].quality / divider;
              }
              avgQlt = Math.max(avgQlt, 1);
              for (let j = 0; j < this.producedMaterials.length; ++j) {
                let tempQlt =
                  office.employeeProductionByJob[CorpEmployeeJob.Engineer] / 90 +
                  Math.pow(this.researchPoints, this.researchFactor) +
                  Math.pow(warehouse.materials["AI Cores"].stored, this.aiCoreFactor) / 10e3;
                const logQlt = Math.max(Math.pow(tempQlt, 0.5), 1);
                tempQlt = Math.min(tempQlt, avgQlt * logQlt);
                warehouse.materials[this.producedMaterials[j]].quality = Math.max(
                  1,
                  (warehouse.materials[this.producedMaterials[j]].quality *
                    warehouse.materials[this.producedMaterials[j]].stored +
                    tempQlt * prod * producableFrac) /
                    (warehouse.materials[this.producedMaterials[j]].stored + prod * producableFrac),
                );
                warehouse.materials[this.producedMaterials[j]].stored += prod * producableFrac;
              }
            } else {
              for (const reqMatName of getRecordKeys(this.requiredMaterials)) {
                warehouse.materials[reqMatName].productionAmount = 0;
              }
            }

            //Per second
            const materialProduction = (prod * producableFrac) / (corpConstants.secondsPerMarketCycle * marketCycles);
            for (const prodMatName of this.producedMaterials) {
              warehouse.materials[prodMatName].productionAmount = materialProduction;
            }
          } else {
            //If this doesn't produce any materials, then it only creates
            //Products. Creating products will consume materials. The
            //Production of all consumed materials must be set to 0
            for (const reqMatName of getRecordKeys(this.requiredMaterials)) {
              warehouse.materials[reqMatName].productionAmount = 0;
            }
          }
          break;

        case "SALE":
          /* Process sale of materials */
          for (const [matName, mat] of getRecordEntries(warehouse.materials)) {
            if ((typeof mat.desiredSellPrice === "number" && mat.desiredSellPrice < 0) || mat.desiredSellAmount === 0) {
              mat.actualSellAmount = 0;
              continue;
            }

            // Sale multipliers
            const businessFactor = this.getBusinessFactor(office); //Business employee productivity
            const advertisingFactor = this.getAdvertisingFactors()[0]; //Awareness + popularity
            const marketFactor = this.getMarketFactor(mat); //Competition + demand

            // Parse player sell-amount input (needed for TA.II and selling)
            let sellAmt: number;
            // The amount gets re-multiplied later, so this is the correct
            // amount to calculate with for "MAX".
            const adjustedQty = mat.stored / (corpConstants.secondsPerMarketCycle * marketCycles);
            if (isString(mat.desiredSellAmount)) {
              //Dynamically evaluated
              let tmp = mat.desiredSellAmount.replace(/MAX/g, (adjustedQty + "").toUpperCase());
              tmp = tmp.replace(/PROD/g, mat.productionAmount + "");
              try {
                sellAmt = eval(tmp);
              } catch (e) {
                dialogBoxCreate(
                  `Error evaluating your sell amount for material ${mat.name} in ${this.name}'s ${city} office. The sell amount is being set to zero`,
                );
                sellAmt = 0;
              }
            } else {
              sellAmt = mat.desiredSellAmount;
            }

            // Determine the cost that the material will be sold at
            const markupLimit = mat.getMarkupLimit();
            let sCost;
            if (mat.marketTa2) {
              // Reverse engineer the 'maxSell' formula
              // 1. Set 'maxSell' = sellAmt
              // 2. Substitute formula for 'markup'
              // 3. Solve for 'sCost'
              const numerator = markupLimit;
              const sqrtNumerator = sellAmt;
              const sqrtDenominator =
                (mat.quality + 0.001) *
                marketFactor *
                businessFactor *
                corporation.getSalesMult() *
                advertisingFactor *
                this.getSalesMultiplier();
              const denominator = Math.sqrt(sqrtNumerator / sqrtDenominator);
              let optimalPrice;
              if (sqrtDenominator === 0 || denominator === 0) {
                if (sqrtNumerator === 0) {
                  optimalPrice = 0; // Nothing to sell
                } else {
                  optimalPrice = mat.marketPrice + markupLimit;
                  console.warn(`In Corporation, found illegal 0s when trying to calculate MarketTA2 sale cost`);
                }
              } else {
                optimalPrice = numerator / denominator + mat.marketPrice;
              }

              // We'll store this "Optimal Price" in a property so that we don't have
              // to re-calculate it for the UI
              mat.marketTa2Price = optimalPrice;

              sCost = optimalPrice;
            } else if (mat.marketTa1) {
              sCost = mat.marketPrice + markupLimit;
            } else if (isString(mat.desiredSellPrice)) {
              sCost = mat.desiredSellPrice.replace(/MP/g, mat.marketPrice + "");
              sCost = eval(sCost);
            } else {
              sCost = mat.desiredSellPrice;
            }

            // Calculate how much of the material sells (per second)
            let markup = 1;
            if (sCost > mat.marketPrice) {
              //Penalty if difference between sCost and bCost is greater than markup limit
              if (sCost - mat.marketPrice > markupLimit) {
                markup = Math.pow(markupLimit / (sCost - mat.marketPrice), 2);
              }
            } else if (sCost < mat.marketPrice) {
              if (sCost <= 0) {
                markup = 1e12; //Sell everything, essentially discard
              } else {
                //Lower prices than market increases sales
                markup = mat.marketPrice / sCost;
              }
            }

            mat.maxSellPerCycle =
              (mat.quality + 0.001) *
              marketFactor *
              markup *
              businessFactor *
              corporation.getSalesMult() *
              advertisingFactor *
              this.getSalesMultiplier();
            if (isString(mat.desiredSellAmount)) {
              //Dynamically evaluated
              let tmp = mat.desiredSellAmount.replace(/MAX/g, (mat.maxSellPerCycle + "").toUpperCase());
              tmp = tmp.replace(/PROD/g, mat.productionAmount + "");

              try {
                sellAmt = eval(tmp);
              } catch (e) {
                dialogBoxCreate(
                  `Error evaluating your sell amount for material ${mat.name} in ${this.name}'s ${city} office. The sell amount is being set to zero, sellAmt is set to ${sellAmt}`,
                );
                sellAmt = 0;
              }
              sellAmt = Math.min(mat.maxSellPerCycle, sellAmt);
              sellAmt = Math.max(sellAmt, 0);
            } else {
              //Player's input value is just a number
              sellAmt = Math.min(mat.maxSellPerCycle, mat.desiredSellAmount);
            }
            sellAmt = Math.min(mat.maxSellPerCycle, sellAmt);
            sellAmt = sellAmt * corpConstants.secondsPerMarketCycle * marketCycles;
            sellAmt = Math.min(mat.stored, sellAmt);
            if (sellAmt < 0) {
              console.warn(`sellAmt calculated to be negative for ${matName} in ${city}`);
              mat.actualSellAmount = 0;
              continue;
            }
            if (sellAmt && sCost >= 0) {
              mat.stored -= sellAmt;
              revenue += sellAmt * sCost;
              mat.actualSellAmount = sellAmt / (corpConstants.secondsPerMarketCycle * marketCycles);
            } else {
              mat.actualSellAmount = 0;
            }
          } //End processing of sale of materials
          break;

        case "EXPORT":
          for (const matName of Object.values(corpConstants.materialNames)) {
            if (Object.hasOwn(warehouse.materials, matName)) {
              const mat = warehouse.materials[matName];
              mat.exportedLastCycle = 0; //Reset export
              for (let expI = 0; expI < mat.exports.length; ++expI) {
                const exp = mat.exports[expI];

                const expIndustry = corporation.divisions.get(exp.division);
                if (!expIndustry) {
                  console.error(`Invalid export! ${exp.division}`);
                  continue;
                }
                const expWarehouse = expIndustry.warehouses[exp.city];
                if (!expWarehouse) {
                  console.error(`Invalid export! ${expIndustry.name} ${exp.city}`);
                  continue;
                }
                const tempMaterial = expWarehouse.materials[matName];

                let amtStr = exp.amount.replace(
                  /MAX/g,
                  (mat.stored / (corpConstants.secondsPerMarketCycle * marketCycles) + "").toUpperCase(),
                );
                amtStr = amtStr.replace(/EPROD/g, mat.productionAmount.toString());
                amtStr = amtStr.replace(/IPROD/g, tempMaterial.productionAmount.toString());
                amtStr = amtStr.replace(/EINV/g, mat.stored.toString());
                amtStr = amtStr.replace(/IINV/g, tempMaterial.stored.toString());
                let amt = 0;
                try {
                  amt = eval(amtStr);
                } catch (e) {
                  dialogBoxCreate(
                    `Calculating export for ${mat.name} in ${this.name}'s ${city} division failed with error: ${e}`,
                  );
                  continue;
                }
                if (isNaN(amt)) {
                  dialogBoxCreate(
                    `Error calculating export amount for ${mat.name} in ${this.name}'s ${city} division.`,
                  );
                  continue;
                }
                amt = amt * corpConstants.secondsPerMarketCycle * marketCycles;

                if (mat.stored < amt) {
                  amt = mat.stored;
                }

                // Make sure theres enough space in warehouse
                if (expWarehouse.sizeUsed >= expWarehouse.size) {
                  // Warehouse at capacity. Exporting doesn't
                  // affect revenue so just return 0's
                  continue;
                } else {
                  const maxAmt = Math.floor((expWarehouse.size - expWarehouse.sizeUsed) / MaterialInfo[matName].size);
                  amt = Math.min(maxAmt, amt);
                }
                if (amt <= 0) {
                  continue;
                }
                expWarehouse.materials[matName].importAmount +=
                  amt / (corpConstants.secondsPerMarketCycle * marketCycles);

                //Pretty sure this can cause some issues if there are multiple sources importing same material to same warehouse
                //but this will do for now
                expWarehouse.materials[matName].quality = Math.max(
                  0.1,
                  (expWarehouse.materials[matName].quality * expWarehouse.materials[matName].stored +
                    amt * mat.quality) /
                    (expWarehouse.materials[matName].stored + amt),
                );

                expWarehouse.materials[matName].stored += amt;
                mat.stored -= amt;
                mat.exportedLastCycle += amt;
                expIndustry.updateWarehouseSizeUsed(expWarehouse);
              }
              //totalExp should be per second
              mat.exportedLastCycle /= corpConstants.secondsPerMarketCycle * marketCycles;
            }
          }

          break;

        case "START":
          break;
        default:
          console.error(`Invalid state: ${this.state}`);
          break;
      } //End switch(this.state)
      this.updateWarehouseSizeUsed(warehouse);
    }
    return [revenue, expenses];
  }

  /** Process product development and production/sale */
  processProducts(marketCycles = 1, corporation: Corporation): [number, number] {
    let revenue = 0;
    const expenses = 0;

    //Create products
    for (const [name, product] of this.products) {
      if (!product.finished) {
        // Product still under development
        if (this.state !== "PRODUCTION") continue;
        const city = product.creationCity;
        const office = this.offices[city];
        if (!office) throw new Error(`Product ${name} being created in a city without an office. This is a bug.`);

        product.createProduct(marketCycles, office.employeeProductionByJob);
        if (product.developmentProgress >= 100) {
          product.finishProduct(this);
        }
        break;
      } else {
        revenue += this.processProduct(marketCycles, product, corporation);
      }
    }
    return [revenue, expenses];
  }

  //Processes FINISHED products
  processProduct(marketCycles = 1, product: Product, corporation: Corporation): number {
    let totalProfit = 0;
    for (const [city, office] of getRecordEntries(this.offices)) {
      const warehouse = this.warehouses[city];
      if (!warehouse) continue;
      switch (this.state) {
        case "PRODUCTION": {
          //Calculate the maximum production of this material based
          //on the office's productivity
          const maxProd =
            this.getOfficeProductivity(office, { forProduct: true }) *
            corporation.getProductionMultiplier() *
            this.productionMult * // Multiplier from materials
            this.getProductionMultiplier() * // Multiplier from research
            this.getProductProductionMultiplier(); // Multiplier from research
          let prod;

          const productionLimit = product.cityData[city].productionLimit;
          //Account for whether production is manually limited
          if (productionLimit !== null) {
            prod = Math.min(maxProd, productionLimit);
          } else {
            prod = maxProd;
          }
          prod *= corpConstants.secondsPerMarketCycle * marketCycles;

          //Calculate net change in warehouse storage making the Products will cost
          let netStorageSize = product.size;
          for (const [reqMatName, reqQty] of getRecordEntries(product.requiredMaterials)) {
            netStorageSize -= MaterialInfo[reqMatName].size * reqQty;
          }

          //If there's not enough space in warehouse, limit the amount of Product
          if (netStorageSize > 0) {
            const maxAmt = Math.floor((warehouse.size - warehouse.sizeUsed) / netStorageSize);
            prod = Math.min(maxAmt, prod);
          }

          warehouse.smartSupplyStore += prod / (corpConstants.secondsPerMarketCycle * marketCycles);

          //Make sure we have enough resources to make our Products
          let producableFrac = 1;
          for (const [reqMatName, reqQty] of getRecordEntries(product.requiredMaterials)) {
            const req = reqQty * prod;
            if (warehouse.materials[reqMatName].stored < req) {
              producableFrac = Math.min(producableFrac, warehouse.materials[reqMatName].stored / req);
            }
          }

          //Make our Products if they are producable
          if (producableFrac > 0 && prod > 0) {
            let avgQlt = 1;
            for (const [reqMatName, reqQty] of getRecordEntries(product.requiredMaterials)) {
              const reqMatQtyNeeded = reqQty * prod * producableFrac;
              warehouse.materials[reqMatName].stored -= reqMatQtyNeeded;
              warehouse.materials[reqMatName].productionAmount -=
                reqMatQtyNeeded / (corpConstants.secondsPerMarketCycle * marketCycles);
              avgQlt += warehouse.materials[reqMatName].quality;
            }
            avgQlt /= Object.keys(product.requiredMaterials).length;
            const tempEffRat = Math.min(product.rating, avgQlt * Math.pow(product.rating, 0.5));
            //Effective Rating
            product.cityData[city].effectiveRating =
              (product.cityData[city].effectiveRating * product.cityData[city].stored +
                tempEffRat * prod * producableFrac) /
              (product.cityData[city].stored + prod * producableFrac);
            //Quantity
            product.cityData[city].stored += prod * producableFrac;
          }

          //Keep track of production Per second
          product.cityData[city].productionAmount =
            (prod * producableFrac) / (corpConstants.secondsPerMarketCycle * marketCycles);
          break;
        }
        case "SALE": {
          //Process sale of Products
          product.productionCost = 0; //Estimated production cost
          for (const [reqMatName, reqQty] of getRecordEntries(product.requiredMaterials)) {
            product.productionCost += reqQty * warehouse.materials[reqMatName].marketPrice;
          }

          // Since its a product, its production cost is increased for labor
          product.productionCost *= corpConstants.baseProductProfitMult;

          // Sale multipliers
          const businessFactor = this.getBusinessFactor(office); //Business employee productivity
          const advertisingFactor = this.getAdvertisingFactors()[0]; //Awareness + popularity
          const marketFactor = this.getMarketFactor(product); //Competition + demand

          // Parse player sell-amount input (needed for TA.II and selling)
          let sellAmt: number | string;
          // The amount gets re-multiplied later, so this is the correct
          // amount to calculate with for "MAX".
          const adjustedQty = product.cityData[city].stored / (corpConstants.secondsPerMarketCycle * marketCycles);
          const desiredSellAmount = product.cityData[city].desiredSellAmount;
          if (isString(desiredSellAmount)) {
            //Sell amount is dynamically evaluated
            let tmp: number | string = desiredSellAmount.replace(/MAX/g, (adjustedQty + "").toUpperCase());
            tmp = tmp.replace(/PROD/g, product.cityData[city].productionAmount.toString());
            try {
              tmp = eval(tmp);
              if (typeof tmp !== "number") throw "";
            } catch (e) {
              dialogBoxCreate(
                `Error evaluating your sell price expression for ${product.name} in ${this.name}'s ${city} office. Sell price is being set to MAX`,
              );
              tmp = product.maxSellAmount;
            }
            sellAmt = tmp;
          } else if (desiredSellAmount && desiredSellAmount > 0) {
            sellAmt = desiredSellAmount;
          } else sellAmt = adjustedQty;

          if (sellAmt < 0) sellAmt = 0;

          // Calculate Sale Cost (sCost), which could be dynamically evaluated
          const markupLimit = Math.max(product.cityData[city].effectiveRating, 0.001) / product.markup;
          let sCost: number;
          const sellPrice = product.cityData[city].desiredSellPrice;
          if (product.marketTa2) {
            // Reverse engineer the 'maxSell' formula
            // 1. Set 'maxSell' = sellAmt
            // 2. Substitute formula for 'markup'
            // 3. Solve for 'sCost', product.pCost = sCost
            const numerator = markupLimit;
            const sqrtNumerator = sellAmt;
            const sqrtDenominator =
              0.5 *
              Math.pow(product.cityData[city].effectiveRating, 0.65) *
              marketFactor *
              corporation.getSalesMult() *
              businessFactor *
              advertisingFactor *
              this.getSalesMultiplier();
            const denominator = Math.sqrt(sqrtNumerator / sqrtDenominator);
            let optimalPrice;
            if (sqrtDenominator === 0 || denominator === 0) {
              if (sqrtNumerator === 0) {
                optimalPrice = 0; // Nothing to sell
              } else {
                optimalPrice = product.productionCost + markupLimit;
                console.warn(`In Corporation, found illegal 0s when trying to calculate MarketTA2 sale cost`);
              }
            } else {
              optimalPrice = numerator / denominator + product.productionCost;
            }

            // Store this "optimal Price" in a property so we don't have to re-calculate for UI
            product.marketTa2Price[city] = optimalPrice;
            sCost = optimalPrice;
          } else if (product.marketTa1) {
            sCost = product.productionCost + markupLimit;
          } else if (isString(sellPrice)) {
            let sCostString = sellPrice;
            if (product.markup === 0) {
              console.error(`mku is zero, reverting to 1 to avoid Infinity`);
              product.markup = 1;
            }
            sCostString = sCostString.replace(/MP/g, product.productionCost + "");
            sCost = Math.max(product.productionCost, eval(sCostString));
          } else {
            sCost = sellPrice;
          }

          let markup = 1;
          if (sCost > product.productionCost) {
            if (sCost - product.productionCost > markupLimit) {
              markup = markupLimit / (sCost - product.productionCost);
            }
          }

          product.maxSellAmount =
            0.5 *
            Math.pow(product.cityData[city].effectiveRating, 0.65) *
            marketFactor *
            corporation.getSalesMult() *
            Math.pow(markup, 2) *
            businessFactor *
            advertisingFactor *
            this.getSalesMultiplier();
          sellAmt = Math.min(product.maxSellAmount, sellAmt);
          sellAmt = sellAmt * corpConstants.secondsPerMarketCycle * marketCycles;
          sellAmt = Math.min(product.cityData[city].stored, sellAmt); //data[0] is qty
          if (sellAmt && sCost) {
            product.cityData[city].stored -= sellAmt; //data[0] is qty
            totalProfit += sellAmt * sCost;
            product.cityData[city].actualSellAmount = sellAmt / (corpConstants.secondsPerMarketCycle * marketCycles); //data[2] is sell property
          } else {
            product.cityData[city].actualSellAmount = 0; //data[2] is sell property
          }
          break;
        }
        case "START":
        case "PURCHASE":
        case "EXPORT":
          break;
        default:
          console.error(`Invalid State: ${this.state}`);
          break;
      } //End switch(this.state)
    }
    return totalProfit;
  }

  resetImports(state: string): void {
    //At the start of the export state, set the imports of everything to 0
    if (state === "EXPORT") {
      for (const warehouse of getRecordValues(this.warehouses)) {
        for (const material of getRecordValues(warehouse.materials)) {
          material.importAmount = 0;
        }
      }
    }
  }

  discontinueProduct(productName: string): void {
    this.products.delete(productName);
  }

  getAdVertCost(): number {
    return 1e9 * Math.pow(1.06, this.numAdVerts);
  }

  applyAdVert(corporation: Corporation): void {
    const advMult = corporation.getAdvertisingMultiplier() * this.getAdvertisingMultiplier();
    const awareness = (this.awareness + 3 * advMult) * (1.005 * advMult);
    this.awareness = Math.min(awareness, Number.MAX_VALUE);

    const popularity = (this.popularity + 1 * advMult) * ((1 + getRandomInt(1, 3) / 200) * advMult);
    this.popularity = Math.min(popularity, Number.MAX_VALUE);

    ++this.numAdVerts;
  }

  // Returns how much of a material can be produced based of office productivity (employee stats)
  getOfficeProductivity(office: OfficeSpace, params: { forProduct?: boolean } = {}): number {
    const opProd = office.employeeProductionByJob[CorpEmployeeJob.Operations];
    const engrProd = office.employeeProductionByJob[CorpEmployeeJob.Engineer];
    const mgmtProd = office.employeeProductionByJob[CorpEmployeeJob.Management];
    const total = opProd + engrProd + mgmtProd;

    if (total <= 0) return 0;

    // Management is a multiplier for the production from Operations and Engineers
    const mgmtFactor = 1 + mgmtProd / (1.2 * total);

    // For production, Operations is slightly more important than engineering
    // Both Engineering and Operations have diminishing returns
    const prod = (Math.pow(opProd, 0.4) + Math.pow(engrProd, 0.3)) * mgmtFactor;

    // Generic multiplier for the production. Used for game-balancing purposes
    const balancingMult = 0.05;

    if (params && params.forProduct) {
      // Products are harder to create and therefore have less production
      return 0.5 * balancingMult * prod;
    } else {
      return balancingMult * prod;
    }
  }

  // Returns a multiplier based on the office' 'Business' employees that affects sales
  getBusinessFactor(office: OfficeSpace): number {
    const businessProd = 1 + office.employeeProductionByJob[CorpEmployeeJob.Business];

    return calculateEffectWithFactors(businessProd, 0.26, 10e3);
  }

  //Returns a set of multipliers based on the Industry's awareness, popularity, and advFac. This
  //multiplier affects sales. The result is:
  //  [Total sales mult, total awareness mult, total pop mult, awareness/pop ratio mult]
  getAdvertisingFactors(): [
    totalFactor: number,
    awarenessFactor: number,
    popularityFactor: number,
    ratioFactor: number,
  ] {
    const awarenessFac = Math.pow(this.awareness + 1, this.advertisingFactor);
    const popularityFac = Math.pow(this.popularity + 1, this.advertisingFactor);
    const ratioFac = this.awareness === 0 ? 0.01 : Math.max((this.popularity + 0.001) / this.awareness, 0.01);
    const totalFac = Math.pow(awarenessFac * popularityFac * ratioFac, 0.85);
    return [totalFac, awarenessFac, popularityFac, ratioFac];
  }

  //Returns a multiplier based on a materials demand and competition that affects sales
  getMarketFactor(item: Material | Product): number {
    return Math.max(0.1, (item.demand * (100 - item.competition)) / 100);
  }

  // Returns a boolean indicating whether this Industry has the specified Research
  hasResearch(name: CorpResearchName): boolean {
    return this.researched.has(name);
  }

  updateResearchTree(): void {
    if (this.treeInitialized) return;
    const researchTree = IndustryResearchTrees[this.type];
    // Need to populate the tree in case we are loading a game.
    for (const research of this.researched) researchTree.research(research);
    // Also need to load researches from the tree in case we are making a new division.
    for (const research of researchTree.researched) this.researched.add(research);
    this.treeInitialized = true;
  }

  // Get multipliers from Research
  getAdvertisingMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getAdvertisingMultiplier();
  }

  getEmployeeChaMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getEmployeeChaMultiplier();
  }

  getEmployeeCreMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getEmployeeCreMultiplier();
  }

  getEmployeeEffMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getEmployeeEffMultiplier();
  }

  getEmployeeIntMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getEmployeeIntMultiplier();
  }

  getProductionMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getProductionMultiplier();
  }

  getProductProductionMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getProductProductionMultiplier();
  }

  getSalesMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getSalesMultiplier();
  }

  getScientificResearchMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getScientificResearchMultiplier();
  }

  getStorageMultiplier(): number {
    const researchTree = IndustryResearchTrees[this.type];
    this.updateResearchTree();
    return researchTree.getStorageMultiplier();
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("Division", this, Division.includedKeys);
  }

  /** Initializes a Industry object from a JSON save state. */
  static fromJSON(value: IReviverValue): Division {
    return Generic_fromJSON(Division, value.data, Division.includedKeys);
  }

  static includedKeys = getKeyList(Division, { removedKeys: ["treeInitialized"] });
}

constructorsForReviver.Division = Division;
