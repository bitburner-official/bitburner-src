// Constructs all CompanyPosition objects using the metadata in data/companypositions.ts
import { getCompaniesMetadata } from "./data/CompaniesMetadata";
import { Company } from "./Company";
import { Reviver, assertLoadingType } from "../utils/JSONReviver";
import { CompanyName } from "./Enums";
import { createEnumKeyedRecord } from "../Types/Record";
import { getEnumHelper } from "../utils/EnumHelper";

export const Companies: Record<CompanyName, Company> = (() => {
  const metadata = getCompaniesMetadata();
  return createEnumKeyedRecord(CompanyName, (name) => new Company(metadata[name]));
})();

// Used to load Companies map from a save
export function loadCompanies(saveString: string): void {
  const loadedCompanies = JSON.parse(saveString, Reviver) as unknown;
  // This loading method allows invalid data in player save, but just ignores anything invalid
  if (!loadedCompanies) return;
  if (typeof loadedCompanies !== "object") return;
  for (const [loadedCompanyName, loadedCompany] of Object.entries(loadedCompanies) as [string, unknown][]) {
    if (!getEnumHelper("CompanyName").isMember(loadedCompanyName)) continue;
    if (!loadedCompany) continue;
    if (typeof loadedCompany !== "object") continue;
    const company = Companies[loadedCompanyName];
    assertLoadingType<Company>(loadedCompany);
    const { playerReputation: loadedRep, favor: loadedFavor } = loadedCompany;
    if (typeof loadedRep === "number" && loadedRep > 0) company.playerReputation = loadedRep;
    if (typeof loadedFavor === "number" && loadedFavor > 0) company.favor = loadedFavor;
  }
}

export function getCompaniesSave(): Record<CompanyName, { favor: number; playerReputation: number }> {
  return createEnumKeyedRecord(CompanyName, (name) => ({
    favor: Companies[name].favor,
    playerReputation: Companies[name].playerReputation,
  }));
}
