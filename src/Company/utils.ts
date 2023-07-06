import type { CompanyName, LocationName } from "@enums";

type LocationNameString = `${LocationName}`;
type CompanyNameString = `${CompanyName}`;
type CompanyNamesAreAllLocationNames = CompanyNameString extends LocationNameString ? true : false;
const __companyNameCheck: CompanyNamesAreAllLocationNames = true;

export function companyNameAsLocationName(companyName: CompanyName): LocationName {
  // Due to the check above, we know that all company names are valid location names.
  return companyName as unknown as LocationName;
}
