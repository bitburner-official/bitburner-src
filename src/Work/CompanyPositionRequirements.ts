export interface CompanyPositionRequirements {
  name: string;
  nextPosition: string | null;
  requiredHacking: number;
  requiredStrength: number;
  requiredDefense: number;
  requiredDexterity: number;
  requiredAgility: number;
  requiredCharisma: number;
  requiredReputation: number;
}

export const newCompanyPositionRequirements = (
  params?: Partial<CompanyPositionRequirements>,
): CompanyPositionRequirements => {
  return {
    name: params?.name ?? "",
    nextPosition: params?.nextPosition ?? "",
    requiredHacking: params?.requiredHacking ?? 0,
    requiredStrength: params?.requiredStrength ?? 0,
    requiredDefense: params?.requiredDefense ?? 0,
    requiredDexterity: params?.requiredDexterity ?? 0,
    requiredAgility: params?.requiredAgility ?? 0,
    requiredCharisma: params?.requiredCharisma ?? 0,
    requiredReputation: params?.requiredReputation ?? 0,
  };
};

/** Scale all stats on a CompanyPositionRequirements object by a number. */
export const scaleCompanyPositionRequirements = (
  c: CompanyPositionRequirements,
  n: number,
): CompanyPositionRequirements => {
  return {
    name: c.name,
    nextPosition: c.nextPosition,
    requiredHacking: c.requiredHacking > 0 ? c.requiredHacking + n : 0,
    requiredStrength: c.requiredStrength > 0 ? c.requiredStrength + n : 0,
    requiredDefense: c.requiredDefense > 0 ? c.requiredDefense + n : 0,
    requiredDexterity: c.requiredDexterity > 0 ? c.requiredDexterity + n : 0,
    requiredAgility: c.requiredAgility > 0 ? c.requiredAgility + n : 0,
    requiredCharisma: c.requiredCharisma > 0 ? c.requiredCharisma + n : 0,
    requiredReputation: c.requiredReputation,
  };
};
