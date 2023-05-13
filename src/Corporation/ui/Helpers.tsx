import { CorpMaterialName } from "@nsdefs";
import { Division } from "../Division";

// Returns a boolean indicating whether the given material is relevant for the
// current industry.
export function isRelevantMaterial(matName: CorpMaterialName, division: Division): boolean {
  // Materials that affect Production multiplier
  const prodMultiplierMats: CorpMaterialName[] = ["Hardware", "Robots", "AI Cores", "Real Estate"];

  if (Object.keys(division.requiredMaterials).includes(matName)) return true;
  if (division.producedMaterials.includes(matName)) return true;
  if (prodMultiplierMats.includes(matName)) return true;

  return false;
}
