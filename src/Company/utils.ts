import type { CompanyName, LocationName } from "@enums";
import { CONSTANTS } from "../Constants";
import { isBackdoorInstalledInCompanyServer } from "../Server/ServerHelpers";

type LocationNameString = `${LocationName}`;
type CompanyNameString = `${CompanyName}`;
type CompanyNamesAreAllLocationNames = CompanyNameString extends LocationNameString ? true : false;
const __companyNameCheck: CompanyNamesAreAllLocationNames = true;

export function companyNameAsLocationName(companyName: CompanyName): LocationName {
  // Due to the check above, we know that all company names are valid location names.
  return companyName as unknown as LocationName;
}

export function calculateEffectiveRequiredReputation(companyName: CompanyName, reputation: number): number {
  return (
    reputation * (isBackdoorInstalledInCompanyServer(companyName) ? CONSTANTS.CompanyRequiredReputationMultiplier : 1)
  );
}
