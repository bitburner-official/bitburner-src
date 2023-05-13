import { CorpEmployeeJob } from "./data/Enums";
import { MaterialInfo } from "./MaterialInfo";
import { Division } from "./Division";
import { IndustriesData } from "./IndustryData";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { CityName } from "../Enums";
import { CorpMaterialName } from "@nsdefs";
import { PartialRecord, createEnumKeyedRecord, getRecordEntries, getRecordKeys } from "../Types/Record";

interface IConstructorParams {
  name: string;
  createCity: CityName;
  designInvestment: number;
  advertisingInvestment: number;
}

export class Product {
  // Product name
  name = "DefaultProductName";

  // The demand for this Product in the market. Gradually decreases
  demand = 0;

  // How much competition there is in the market for this Product
  competition = 0;

  // Markup. Affects how high of a price you can charge for this Product
  // without suffering a loss in the # of sales
  markup = 0;

  // Production cost - estimation of how much money it costs to make this Product
  productionCost = 0;

  // Sell costs
  sellPrices: Record<CityName, string | number> = createEnumKeyedRecord(CityName, () => 0);

  // Variables for handling the creation process of this Product
  finished = false; // Whether this Product has finished being created
  progress = 0; // Creation progress - A number between 0-100 representing percentage
  creationCity = CityName.Sector12; // City in which the product is/was being created
  designInvestment = 0; // How much money was invested into designing this Product
  advertisingInvestment = 0; // How much money was invested into advertising this Product

  // The average employee productivity and scientific research across the creation of the Product
  creationProd = {
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
  overallRating = 0;

  // Stats/properties of this Product
  quality = 0;
  performance = 0;
  durability = 0;
  reliability = 0;
  aesthetics = 0;
  features = 0;

  // Data refers to the production, sale, and quantity of the products
  // These values are specific to a city
  // For each city, the data is [qty, prod, sell, effRat]
  data = createEnumKeyedRecord(CityName, () => ({
    inventory: 0,
    productionAmount: 0,
    actualSellAmount: 0,
    effectiveRating: 0,
  }));

  // How much space 1 unit of the Product takes (in the warehouse)
  // Not applicable for all Products
  size = 0;

  // Material requirements. An object that maps the name of a material to how much it requires
  // to make 1 unit of the product.
  reqMats: PartialRecord<CorpMaterialName, number> = {};

  // Data to keep track of whether production/sale of this Product is
  // manually limited. These values are specific to a city
  //  [Whether production/sale is limited, limit amount]
  productionLimit: Record<CityName, number | null> = createEnumKeyedRecord(CityName, () => null);
  desiredSellAmount: Record<CityName, number | string> = createEnumKeyedRecord(CityName, () => 0);

  // Flags that signal whether automatic sale pricing through Market TA is enabled
  marketTa1 = false;
  marketTa2 = false;
  marketTa2Price = createEnumKeyedRecord(CityName, () => 0);

  // Determines the maximum amount of this product that can be sold in one market cycle
  maxsll = 0;
  constructor(params: IConstructorParams | null = null) {
    if (!params) return;
    this.name = params.name;
    this.creationCity = params.createCity;
    this.designInvestment = params.designInvestment;
    this.advertisingInvestment = params.advertisingInvestment;
  }

  // Make progress on this product based on current employee productivity
  createProduct(marketCycles: number, employeeProd: typeof Product.prototype.creationProd): void {
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
    const progress = Math.min(marketCycles * 0.01 * prodMult, 100 - this.progress);
    if (progress <= 0) {
      return;
    }

    this.progress += progress;
    for (const pos of getRecordKeys(employeeProd)) {
      this.creationProd[pos] += (employeeProd[pos] * progress) / 100;
    }
  }

  // @param industry - Industry object. Reference to industry that makes this Product
  finishProduct(industry: Division): void {
    this.finished = true;

    // Calculate properties
    const totalProd = this.creationProd.total;
    const engrRatio = this.creationProd[CorpEmployeeJob.Engineer] / totalProd;
    const mgmtRatio = this.creationProd[CorpEmployeeJob.Management] / totalProd;
    const rndRatio = this.creationProd[CorpEmployeeJob.RandD] / totalProd;
    const opsRatio = this.creationProd[CorpEmployeeJob.Operations] / totalProd;
    const busRatio = this.creationProd[CorpEmployeeJob.Business] / totalProd;

    const designMult = 1 + Math.pow(this.designInvestment, 0.1) / 100;
    const balanceMult = 1.2 * engrRatio + 0.9 * mgmtRatio + 1.3 * rndRatio + 1.5 * opsRatio + busRatio;
    const sciMult = 1 + Math.pow(industry.researchPoints, industry.researchFactor) / 800;
    const totalMult = balanceMult * designMult * sciMult;

    this.quality =
      totalMult *
      (0.1 * this.creationProd[CorpEmployeeJob.Engineer] +
        0.05 * this.creationProd[CorpEmployeeJob.Management] +
        0.05 * this.creationProd[CorpEmployeeJob.RandD] +
        0.02 * this.creationProd[CorpEmployeeJob.Operations] +
        0.02 * this.creationProd[CorpEmployeeJob.Business]);
    this.performance =
      totalMult *
      (0.15 * this.creationProd[CorpEmployeeJob.Engineer] +
        0.02 * this.creationProd[CorpEmployeeJob.Management] +
        0.02 * this.creationProd[CorpEmployeeJob.RandD] +
        0.02 * this.creationProd[CorpEmployeeJob.Operations] +
        0.02 * this.creationProd[CorpEmployeeJob.Business]);
    this.durability =
      totalMult *
      (0.05 * this.creationProd[CorpEmployeeJob.Engineer] +
        0.02 * this.creationProd[CorpEmployeeJob.Management] +
        0.08 * this.creationProd[CorpEmployeeJob.RandD] +
        0.05 * this.creationProd[CorpEmployeeJob.Operations] +
        0.05 * this.creationProd[CorpEmployeeJob.Business]);
    this.reliability =
      totalMult *
      (0.02 * this.creationProd[CorpEmployeeJob.Engineer] +
        0.08 * this.creationProd[CorpEmployeeJob.Management] +
        0.02 * this.creationProd[CorpEmployeeJob.RandD] +
        0.05 * this.creationProd[CorpEmployeeJob.Operations] +
        0.08 * this.creationProd[CorpEmployeeJob.Business]);
    this.aesthetics =
      totalMult *
      (0.0 * this.creationProd[CorpEmployeeJob.Engineer] +
        0.08 * this.creationProd[CorpEmployeeJob.Management] +
        0.05 * this.creationProd[CorpEmployeeJob.RandD] +
        0.02 * this.creationProd[CorpEmployeeJob.Operations] +
        0.1 * this.creationProd[CorpEmployeeJob.Business]);
    this.features =
      totalMult *
      (0.08 * this.creationProd[CorpEmployeeJob.Engineer] +
        0.05 * this.creationProd[CorpEmployeeJob.Management] +
        0.02 * this.creationProd[CorpEmployeeJob.RandD] +
        0.05 * this.creationProd[CorpEmployeeJob.Operations] +
        0.05 * this.creationProd[CorpEmployeeJob.Business]);
    this.calculateRating(industry);
    const advMult = 1 + Math.pow(this.advertisingInvestment, 0.1) / 100;
    const busmgtgRatio = Math.max(busRatio + mgmtRatio, 1 / totalProd);
    this.markup = 100 / (advMult * Math.pow(this.quality + 0.001, 0.65) * busmgtgRatio);

    // I actually don't understand well enough to know if this is right.
    // I'm adding this to prevent a crash.
    if (this.markup === 0 || !isFinite(this.markup)) this.markup = 1;

    this.demand =
      industry.awareness === 0 ? 20 : Math.min(100, advMult * (100 * (industry.popularity / industry.awareness)));
    this.competition = getRandomInt(0, 70);

    //Calculate the product's required materials and size
    this.size = 0;
    for (const [matName, reqQty] of getRecordEntries(industry.requiredMaterials)) {
      this.reqMats[matName] = reqQty;
      this.size += MaterialInfo[matName].size * reqQty;
    }
  }

  calculateRating(industry: Division): void {
    const weights = IndustriesData[industry.type].product?.ratingWeights;
    if (!weights) return console.error(`Could not find product rating weights for: ${industry}`);
    this.overallRating = 0;
    this.overallRating += weights.quality ? this.quality * weights.quality : 0;
    this.overallRating += weights.performance ? this.performance * weights.performance : 0;
    this.overallRating += weights.durability ? this.durability * weights.durability : 0;
    this.overallRating += weights.reliability ? this.reliability * weights.reliability : 0;
    this.overallRating += weights.aesthetics ? this.aesthetics * weights.aesthetics : 0;
    this.overallRating += weights.features ? this.features * weights.features : 0;
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
