import type { Division } from "./Division";

import { CorpMaterialName } from "@nsdefs";
import { CityName, CorpEmployeeJob } from "@enums";
import { IndustriesData } from "./data/IndustryData";
import { MaterialInfo } from "./MaterialInfo";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { getRandomIntInclusive } from "../utils/helpers/getRandomIntInclusive";
import { PartialRecord, createEnumKeyedRecord, getRecordEntries, getRecordKeys } from "../Types/Record";

interface IConstructorParams {
  name: string;
  createCity: CityName;
  designInvestment: number;
  advertisingInvestment: number;
}

/** A corporation product. Products are shared across the entire division, unlike materials which are per-warehouse */
export class Product {
  /** Name of the product */
  name = "DefaultProductName";

  /** Demand for this product, which goes down over time. */
  demand = 0;

  /** Competition for this product */
  competition = 0;

  /** Markup. Affects how high of a price you can charge for this Product
  without suffering a loss in the # of sales */
  markup = 0;

  /** Whether the development for this product is finished yet */
  finished = false;
  developmentProgress = 0; // Creation progress - A number between 0-100 representing percentage
  creationCity = CityName.Sector12; // City in which the product is/was being created
  designInvestment = 0; // How much money was invested into designing this Product
  advertisingInvestment = 0; // How much money was invested into advertising this Product

  // The average employee productivity and scientific research across the creation of the Product
  creationJobFactors = {
    [CorpEmployeeJob.Operations]: 0,
    [CorpEmployeeJob.Engineer]: 0,
    [CorpEmployeeJob.Business]: 0,
    [CorpEmployeeJob.Management]: 0,
    [CorpEmployeeJob.RandD]: 0,
    total: 0,
  };

  // Aggregate score for this Product's 'rating'
  // This is based on the stats/properties below. The weighting of the
  // stats/properties below differs between different industries
  rating = 0;

  /** Stats of the product */
  stats = {
    quality: 0,
    performance: 0,
    durability: 0,
    reliability: 0,
    aesthetics: 0,
    features: 0,
  };

  // data that is stored per city
  cityData = createEnumKeyedRecord(CityName, () => ({
    /** Amount of product stored in warehouse */
    stored: 0,
    /** Amount of this product produced per cycle in this city */
    productionAmount: 0,
    /** Amount of this product that was sold last cycle in this city */
    actualSellAmount: 0,
    /** Total effective rating of the product in this city */
    effectiveRating: 0,
    /** Manual limit on production amount for the product in this city*/
    productionLimit: null as number | null,
    /** Player input sell amount e.g. "MAX" */
    desiredSellAmount: 0 as number | string,
    /** Player input sell price e.g. "MP * 5" */
    desiredSellPrice: "" as string | number,
    /** Cost of producing this product if buying its component materials at market price */
    productionCost: 0,
  }));

  /** How much warehouse space is occupied per unit of this product */
  size = 0;

  /** Required materials per unit of this product */
  requiredMaterials: PartialRecord<CorpMaterialName, number> = {};

  // Flags that signal whether automatic sale pricing through Market TA is enabled
  marketTa1 = false;
  marketTa2 = false;
  uiMarketPrice = createEnumKeyedRecord(CityName, () => 0);

  /** Effective number that "MAX" represents in a sell amount */
  maxSellAmount = 0;

  constructor(params: IConstructorParams | null = null) {
    if (!params) return;
    this.name = params.name;
    this.creationCity = params.createCity;
    this.designInvestment = params.designInvestment;
    this.advertisingInvestment = params.advertisingInvestment;
  }

  // Make progress on this product based on current employee productivity
  createProduct(marketCycles: number, employeeProd: typeof Product.prototype.creationJobFactors): void {
    if (this.finished) return;

    // Designing/Creating a Product is based mostly off Engineers
    const opProd = employeeProd[CorpEmployeeJob.Operations];
    const engrProd = employeeProd[CorpEmployeeJob.Engineer];
    const mgmtProd = employeeProd[CorpEmployeeJob.Management];
    const total = opProd + engrProd + mgmtProd;
    if (total <= 0) {
      return;
    }

    // Management is a multiplier for the production from Engineers
    const mgmtFactor = 1 + mgmtProd / (1.2 * total);
    const prodMult = (Math.pow(engrProd, 0.34) + Math.pow(opProd, 0.2)) * mgmtFactor;
    const progress = Math.min(marketCycles * 0.01 * prodMult, 100 - this.developmentProgress);
    if (progress <= 0) {
      return;
    }

    this.developmentProgress += progress;
    for (const pos of getRecordKeys(employeeProd)) {
      this.creationJobFactors[pos] += (employeeProd[pos] * progress) / 100;
    }
  }

  // @param division - Division object. Reference to division that makes this Product
  finishProduct(division: Division): void {
    this.finished = true;

    // Calculate properties
    const totalProd = this.creationJobFactors.total;
    const engrRatio = this.creationJobFactors[CorpEmployeeJob.Engineer] / totalProd;
    const mgmtRatio = this.creationJobFactors[CorpEmployeeJob.Management] / totalProd;
    const rndRatio = this.creationJobFactors[CorpEmployeeJob.RandD] / totalProd;
    const opsRatio = this.creationJobFactors[CorpEmployeeJob.Operations] / totalProd;
    const busRatio = this.creationJobFactors[CorpEmployeeJob.Business] / totalProd;

    const designMult = 1 + Math.pow(this.designInvestment, 0.1) / 100;
    const balanceMult = 1.2 * engrRatio + 0.9 * mgmtRatio + 1.3 * rndRatio + 1.5 * opsRatio + busRatio;
    const sciMult = 1 + Math.pow(division.researchPoints, division.researchFactor) / 800;
    const totalMult = balanceMult * designMult * sciMult;

    this.stats.quality =
      totalMult *
      (0.1 * this.creationJobFactors[CorpEmployeeJob.Engineer] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.Management] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.RandD] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.Operations] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.Business]);
    this.stats.performance =
      totalMult *
      (0.15 * this.creationJobFactors[CorpEmployeeJob.Engineer] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.Management] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.RandD] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.Operations] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.Business]);
    this.stats.durability =
      totalMult *
      (0.05 * this.creationJobFactors[CorpEmployeeJob.Engineer] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.Management] +
        0.08 * this.creationJobFactors[CorpEmployeeJob.RandD] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.Operations] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.Business]);
    this.stats.reliability =
      totalMult *
      (0.02 * this.creationJobFactors[CorpEmployeeJob.Engineer] +
        0.08 * this.creationJobFactors[CorpEmployeeJob.Management] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.RandD] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.Operations] +
        0.08 * this.creationJobFactors[CorpEmployeeJob.Business]);
    this.stats.aesthetics =
      totalMult *
      (0.0 * this.creationJobFactors[CorpEmployeeJob.Engineer] +
        0.08 * this.creationJobFactors[CorpEmployeeJob.Management] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.RandD] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.Operations] +
        0.1 * this.creationJobFactors[CorpEmployeeJob.Business]);
    this.stats.features =
      totalMult *
      (0.08 * this.creationJobFactors[CorpEmployeeJob.Engineer] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.Management] +
        0.02 * this.creationJobFactors[CorpEmployeeJob.RandD] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.Operations] +
        0.05 * this.creationJobFactors[CorpEmployeeJob.Business]);
    this.calculateRating(division);
    const advMult = 1 + Math.pow(this.advertisingInvestment, 0.1) / 100;
    const busmgtgRatio = Math.max(busRatio + mgmtRatio, 1 / totalProd);
    this.markup = 100 / (advMult * Math.pow(this.stats.quality + 0.001, 0.65) * busmgtgRatio);

    // I actually don't understand well enough to know if this is right.
    // I'm adding this to prevent a crash.
    if (this.markup === 0 || !isFinite(this.markup)) this.markup = 1;

    this.demand =
      division.awareness === 0 ? 20 : Math.min(100, advMult * (100 * (division.popularity / division.awareness)));
    this.competition = getRandomIntInclusive(0, 70);

    //Calculate the product's required materials and size
    this.size = 0;
    for (const [matName, reqQty] of getRecordEntries(division.requiredMaterials)) {
      this.requiredMaterials[matName] = reqQty;
      this.size += MaterialInfo[matName].size * reqQty;
    }
  }

  calculateRating(industry: Division): void {
    const weights = IndustriesData[industry.type].product?.ratingWeights;
    if (!weights) return console.error(`Could not find product rating weights for: ${industry}`);
    this.rating = getRecordEntries(weights).reduce(
      (total, [statName, weight]) => total + this.stats[statName] * weight,
      0,
    );
  }

  // Serialize the current object to a JSON save state.
  toJSON(): IReviverValue {
    return Generic_toJSON("Product", this);
  }

  // Initializes a Product object from a JSON save state.
  static fromJSON(value: IReviverValue): Product {
    return Generic_fromJSON(Product, value.data);
  }
}

constructorsForReviver.Product = Product;
