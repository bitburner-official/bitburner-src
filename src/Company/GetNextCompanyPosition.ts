// Function that returns the next Company Position in the "ladder"
// i.e. the next position to get promoted to
import type { CompanyPosition } from "./CompanyPosition";
import { CompanyPositions } from "./CompanyPositions";

export function getNextCompanyPositionHelper(currPos: CompanyPosition | null): CompanyPosition | null {
  if (!currPos) return null;

  const nextPosName = currPos.nextPosition;
  if (!nextPosName) return null;

  return CompanyPositions[nextPosName];
}
