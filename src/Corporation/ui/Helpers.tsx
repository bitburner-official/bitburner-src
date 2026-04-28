import { CorpMaterialName } from "@nsdefs";
import { Division } from "../Division";
import { boostMaterials } from "../data/Constants";

// Returns a boolean indicating whether the given material is relevant for the
// current industry.
export function isRelevantMaterial(matName: CorpMaterialName, division: Division): boolean {
  if (Object.keys(division.requiredMaterials).includes(matName)) return true;
  if (division.producedMaterials.includes(matName)) return true;
  if (boostMaterials.includes(matName)) return true;

  return false;
}
