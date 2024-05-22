import { CorpMaterialName } from "@nsdefs";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { materialNames } from "./data/Constants";
import { Export } from "./Export";
import { MaterialInfo } from "./MaterialInfo";

interface IConstructorParams {
  name: CorpMaterialName;
}

export class Material {
  // Name of material
  name: CorpMaterialName;

  // Amount of material owned
  stored = 0;

  // Material's "quality". Unbounded
  quality = 1;

  // How much demand the Material has in the market, and the range of possible
  // values for this "demand"
  demand = 0;
  demandRange: number[] = [0, 0];

  // How much competition there is for this Material in the market, and the range
  // of possible values for this "competition"
  competition = 0;
  competitionRange: number[] = [0, 0];

  // Maximum volatility of this Materials stats
  maxVolatility = 0;

  // Markup. Determines how high of a price you can charge on the material
  // compared to the market price without suffering loss in # of sales
  // Quality is divided by this to determine markup limits
  // e,g, If mku is 10 and quality is 100 then you can markup prices by 100/10 = 10
  markup = 0;

  // How much of this material is being bought, sold, imported and produced every second
  buyAmount = 0;
  actualSellAmount = 0;
  productionAmount = 0;
  importAmount = 0;

  // Exports of this material to another warehouse/industry
  exports: Export[] = [];

  // Total amount of this material exported in the last cycle
  exportedLastCycle = 0;

  // Cost / sec to buy this material. AKA Market Price
  marketPrice = 0;

  // Average price paid for the material (accounted as marketPrice for produced/imported materials)
  averagePrice = 0;

  /** null if there is no limit set on production. 0 actually limits production to 0. */
  productionLimit: number | null = null;

  // Player inputs for sell price and amount.
  desiredSellAmount: string | number = 0;
  desiredSellPrice: string | number = "";

  // Flags that signal whether automatic sale pricing through Market TA is enabled
  marketTa1 = false;
  marketTa2 = false;
  uiMarketPrice = 0;

  // Determines the maximum amount of this material that can be sold in one market cycle
  maxSellPerCycle = 0;

  constructor(params?: IConstructorParams) {
    this.name = params?.name ?? materialNames[0];
    this.demand = MaterialInfo[this.name].demandBase;
    this.demandRange = MaterialInfo[this.name].demandRange;
    this.competition = MaterialInfo[this.name].competitionBase;
    this.competitionRange = MaterialInfo[this.name].competitionRange;
    this.marketPrice = MaterialInfo[this.name].baseCost;
    this.averagePrice = this.marketPrice;
    this.maxVolatility = MaterialInfo[this.name].maxVolatility;
    this.markup = MaterialInfo[this.name].baseMarkup;
  }

  getMarkupLimit(): number {
    return this.quality / this.markup;
  }

  // Process change in demand, competition, and buy cost of this material
  processMarket(): void {
    // The price will change in accordance with demand and competition.
    // e.g. If demand goes up, then so does price. If competition goes up, price goes down
    const priceVolatility: number = (Math.random() * this.maxVolatility) / 300;
    const priceChange: number = 1 + priceVolatility;

    //This 1st random check determines whether competition increases or decreases
    const compVolatility: number = (Math.random() * this.maxVolatility) / 100;
    const compChange: number = 1 + compVolatility;
    if (Math.random() < 0.5) {
      this.competition *= compChange;
      if (this.competition > this.competitionRange[1]) {
        this.competition = this.competitionRange[1];
      }
      this.marketPrice *= 1 / priceChange; // Competition increases, so price goes down
    } else {
      this.competition *= 1 / compChange;
      if (this.competition < this.competitionRange[0]) {
        this.competition = this.competitionRange[0];
      }
      this.marketPrice *= priceChange; // Competition decreases, so price goes up
    }

    // This 2nd random check determines whether demand increases or decreases
    const dmdVolatility: number = (Math.random() * this.maxVolatility) / 100;
    const dmdChange: number = 1 + dmdVolatility;
    if (Math.random() < 0.5) {
      this.demand *= dmdChange;
      if (this.demand > this.demandRange[1]) {
        this.demand = this.demandRange[1];
      }
      this.marketPrice *= priceChange; // Demand increases, so price goes up
    } else {
      this.demand *= 1 / dmdChange;
      if (this.demand < this.demandRange[0]) {
        this.demand = this.demandRange[0];
      }
      this.marketPrice *= 1 / priceChange;
    }
  }

  // Serialize the current object to a JSON save state.
  toJSON(): IReviverValue {
    return Generic_toJSON("Material", this);
  }

  // Initializes a Material object from a JSON save state.
  static fromJSON(value: IReviverValue): Material {
    const material = Generic_fromJSON(Material, value.data);
    if (isNaN(material.quality)) {
      material.quality = 1;
    }
    // averagePrice has not been initialized properly, so if it is 0 (wrong initial value), we set it to marketPrice.
    if (material.averagePrice === 0) {
      material.averagePrice = material.marketPrice;
    }
    return material;
  }
}

constructorsForReviver.Material = Material;
