import type { Corporation } from "./Corporation";
import type { Division } from "./Division";

import { Player } from "@player";
import { CorpMaterialName, CorpSmartSupplyOption } from "@nsdefs";
import { CityName, CorpUnlockName } from "@enums";
import { Material } from "./Material";
import { MaterialInfo } from "./MaterialInfo";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { materialNames } from "./data/Constants";
import { createFullRecordFromEntries, getRecordEntries } from "../Types/Record";

interface IConstructorParams {
  division: Division;
  loc: CityName;
  size: number;
}

export class Warehouse {
  // Warehouse's level, which affects its maximum size
  level = 1;

  // City that this Warehouse is in
  city = CityName.Sector12;

  // Map of Materials held by this Warehouse
  materials = createFullRecordFromEntries(materialNames.map((matName) => [matName, new Material({ name: matName })]));

  // Maximum amount warehouse can hold
  size = 0;

  // Amount of space currently used by warehouse
  sizeUsed = 0;

  // Whether Smart Supply is enabled for this Industry (the Industry that this Warehouse is for)
  smartSupplyEnabled = false;

  // Decide if smart supply should use the amount of materials imported into account when deciding on the amount to buy.
  smartSupplyOptions = createFullRecordFromEntries<CorpMaterialName, CorpSmartSupplyOption>(
    materialNames.map((matName) => [matName, "leftovers"]),
  );

  // Stores the amount of product to be produced. Used for Smart Supply unlock.
  // The production tracked by smart supply is always based on the previous cycle,
  // so it will always trail the "true" production by 1 cycle
  smartSupplyStore = 0;

  constructor(params: IConstructorParams | null = null) {
    const corp = Player.corporation;
    if (!corp || params === null) return;
    this.city = params.loc;
    this.size = params.size;
    this.updateSize(corp, params.division);

    // Default smart supply to being enabled if the upgrade is unlocked
    if (corp.unlocks.has(CorpUnlockName.SmartSupply)) {
      this.smartSupplyEnabled = true;
    }
  }

  // Re-calculate how much space is being used by this Warehouse
  updateMaterialSizeUsed(): void {
    this.sizeUsed = 0;
    for (const [matName, mat] of getRecordEntries(this.materials)) {
      this.sizeUsed += mat.stored * MaterialInfo[matName].size;
    }
    if (this.sizeUsed > this.size) {
      console.warn("Warehouse size used greater than capacity, something went wrong");
    }
  }

  updateSize(corporation: Corporation, division: Division): void {
    this.size = this.level * 100 * corporation.getStorageMultiplier() * division.getStorageMultiplier();
  }

  // Serialize the current object to a JSON save state.
  toJSON(): IReviverValue {
    return Generic_toJSON("Warehouse", this);
  }

  // Initializes a Warehouse object from a JSON save state.
  static fromJSON(value: IReviverValue): Warehouse {
    return Generic_fromJSON(Warehouse, value.data);
  }
}

constructorsForReviver.Warehouse = Warehouse;
