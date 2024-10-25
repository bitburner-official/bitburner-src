import { JSONMap } from "../Types/Jsonable";
import { PartialRecord } from "../Types/Record";
import { CorpMaterialName } from "./Enums";
import { MaterialInfo } from "./MaterialInfo";
import { Product } from "./Product";
import { Warehouse } from "./Warehouse";

type RatioData = {
  matName: CorpMaterialName | null;
  ratio: number;
};

function normalize(ratios: RatioData[]): void {
  const total = ratios.reduce((sum, item) => sum + item.ratio, 0);
  ratios.forEach((item) => {
    item.ratio /= total; // when total is 0, normalize has undefined behavior
  });
}

// This function calculates the volume of an input material that shell be used for production.
// When the smart supply option is set to "imports", it returns the amount of materials that are being imported.
// When the smart supply option is set to "leftovers", it returns the amount of materials that are already in the warehouse.
// Otherwise, it returns 0.
function getSmartSupplyUsableMaterial(warehouse: Warehouse, mname: CorpMaterialName, passedSeconds: number): number {
  const supplyOption = warehouse.smartSupplyOptions[mname];
  const material = warehouse.materials[mname];
  let amount = 0;
  if (supplyOption === "imports") {
    // Use atleast the amount of materials that are being stored, but no more than the amount that is being imported.
    amount = Math.min(material.importAmount * passedSeconds, material.stored);
  } else if (supplyOption === "leftovers") {
    amount = material.stored;
  }
  return MaterialInfo[mname].size * amount;
}

// This function calculates the production capacity for output materials and products in a city.
// It takes into account the production limits of both the materials and the products.
// Additionally, it calculates the average size of all output materials and products.
// Returns [averageSize, output capacity, product capacity]
export function getProductionCapacity(
  warehouse: Warehouse,
  producedMaterials: CorpMaterialName[],
  products: JSONMap<string, Product>,
  prodMultOutput: number,
  prodMultProducts: number,
): [number, number, number] {
  if (prodMultOutput <= 0 || prodMultProducts <= 0) {
    return [0, 0, 0]; // should not happen
  }

  let totalOutputProdVolume = 0;
  let totalProductProdVolume = 0;
  let totalOutputProd = 0;
  let totalProductProd = 0;

  // Production limit is currently broken
  // The first lines are how it should be imo, but the third line is how it is currently in the game
  // const getMatProductionLimit = (mat: CorpMaterialName) => warehouse.materials[mat].productionLimit ?? Infinity;
  // const getMatProductionLimit = (mat: CorpMaterialName) => Math.min(...producedMaterials.map((mat) => warehouse.materials[mat].productionLimit!)) ?? Infinity;
  const getMatProductionLimit = (__: any) => warehouse.materials[producedMaterials[0]].productionLimit ?? Infinity;
  const getProductProductionLimit = (product: Product) =>
    product?.cityData[warehouse.city]?.productionLimit ?? Infinity;

  producedMaterials.forEach((mat) => {
    const limit = Math.min(getMatProductionLimit(mat), prodMultOutput);
    totalOutputProdVolume += limit * MaterialInfo[mat].size;
    totalOutputProd += limit / producedMaterials.length; // output materials are produced together
  });

  products.forEach((product) => {
    if (product.finished) {
      const limit = Math.min(getProductProductionLimit(product), prodMultProducts);
      totalProductProdVolume += limit * product.size;
      totalProductProd += limit;
    }
  });

  // avg Out+Prod size = TotalVolume / TotalProduction
  const averageSize = (totalOutputProdVolume + totalProductProdVolume) / (totalOutputProd + totalProductProd);
  return [averageSize, totalOutputProd, totalProductProd];
}

// Smart Supply Algorithm
// This function calculates the amount of materials to buy for production.
// It takes into account the production capacity, the amount of materials already in the warehouse,
// the available empty space in the warehouse, and the amount of materials that are being imported.
export function smartSupply(
  warehouse: Warehouse,
  requiredMaterials: PartialRecord<CorpMaterialName, number>,
  productionCapacity: number,
  averageOutSize: number,
  passedSeconds: number,
) {
  if (!warehouse.smartSupplyEnabled || Object.keys(requiredMaterials).length === 0) {
    return;
  }

  // 1. Calculate the space that can be used for input materials, considering the space needed for products and imported materials.
  const totalImportSpace = Object.keys(warehouse.materials).reduce(
    (total, key) =>
      total +
      warehouse.materials[key as CorpMaterialName].importAmount *
        MaterialInfo[key as CorpMaterialName].size *
        passedSeconds,
    0,
  );

  const free = warehouse.size - totalImportSpace - warehouse.sizeUsed;
  const alreadyUsedByRequiredMaterials = Object.keys(requiredMaterials).reduce(
    (sum, mat) => sum + getSmartSupplyUsableMaterial(warehouse, mat as CorpMaterialName, passedSeconds),
    0,
  );
  let availableSpace = free + alreadyUsedByRequiredMaterials;

  // 2. Determine the ratios of all input materials.
  const ratios: RatioData[] = [];
  for (const [matName, amount] of Object.entries(requiredMaterials)) {
    if (amount !== undefined && amount !== 0) {
      const ratioData: RatioData = {
        matName: matName as CorpMaterialName,
        ratio: (amount as number) * MaterialInfo[matName as CorpMaterialName].size,
      };
      ratios.push(ratioData);
    }
  }
  // Add some output space temporarily
  ratios.push({ matName: null, ratio: averageOutSize } as RatioData);
  normalize(ratios); // Normalize, which yields the output ratio

  // When products require more space than their base materials, we need to reserve extra space.
  const outputRatio = ratios.pop()!.ratio;
  const inputRatio = 1 - outputRatio;
  // Adjust the space being available by applying the geometric series formula to find the optimal ratio.
  availableSpace *= Math.min(1, inputRatio / outputRatio);
  normalize(ratios);

  // 3. Determine the ratios of existing materials to needed materials.
  const getExistingRatio = (ratioData: RatioData): number => {
    const needed = ratioData.ratio * availableSpace;
    const existing = getSmartSupplyUsableMaterial(warehouse, ratioData.matName!, passedSeconds);
    return existing / needed;
  };

  ratios.sort((a, b) => getExistingRatio(a) - getExistingRatio(b)); // sort ascending by their existing-ratio

  // 4. Purchase the missing materials, starting with the materials that are least needed.
  //    If there is an excess of a material, reduce the total available space and recalculate the ratios.
  while (ratios.length !== 0 && getExistingRatio(ratios[ratios.length - 1])! >= 1) {
    const next = ratios.pop()!;
    availableSpace -= getExistingRatio(next) * next.ratio * availableSpace;
    warehouse.materials[next.matName!].buyAmount = 0; // don't buy
    normalize(ratios);
  }
  while (ratios.length !== 0) {
    const next = ratios.pop()!;
    const material = warehouse.materials[next.matName!];
    const size = MaterialInfo[next.matName!].size;
    const amountVolume = next.ratio * availableSpace; // determine missing volume
    const amount = amountVolume / size;
    const maxAmount = productionCapacity * requiredMaterials[next.matName!]!;
    const finalAmount = Math.min(amount, maxAmount); // don't buy over production capacity
    const usableAmount = getSmartSupplyUsableMaterial(warehouse, next.matName!, passedSeconds) / size;
    material.buyAmount = Math.max(0, finalAmount - usableAmount) / passedSeconds;
  }
}
