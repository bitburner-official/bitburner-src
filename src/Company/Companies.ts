// Constructs all CompanyPosition objects using the metadata in data/companypositions.ts
import { getCompaniesMetadata } from "./data/CompaniesMetadata";
import { Company } from "./Company";
import { Reviver } from "../utils/JSONReviver";
import { assertLoadingType } from "../utils/TypeAssertion";
import { CompanyName } from "./Enums";
import { PartialRecord, createEnumKeyedRecord } from "../Types/Record";
import { getEnumHelper } from "../utils/EnumHelper";

export const Companies: Record<CompanyName, Company> = (() => {
  const metadata = getCompaniesMetadata();
  return createEnumKeyedRecord(CompanyName, (name) => new Company(metadata[name]));
})();

type SavegameCompany = { favor?: number; playerReputation?: number };

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
    assertLoadingType<SavegameCompany>(loadedCompany);
    const { playerReputation: loadedRep, favor: loadedFavor } = loadedCompany;
    if (typeof loadedRep === "number" && loadedRep > 0) company.playerReputation = loadedRep;
    if (typeof loadedFavor === "number" && loadedFavor > 0) company.favor = loadedFavor;
  }
}

// Most companies are usually at default values, so we'll only save the companies with non-default data
export function getCompaniesSave(): PartialRecord<CompanyName, SavegameCompany> {
  const save: PartialRecord<CompanyName, SavegameCompany> = {};
  for (const companyName of getEnumHelper("CompanyName").valueArray) {
    const { favor, playerReputation } = Companies[companyName];
    if (favor || playerReputation) {
      save[companyName] = { favor: favor || undefined, playerReputation: playerReputation || undefined };
    }
  }
  return save;
}
