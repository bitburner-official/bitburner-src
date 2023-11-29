// "Capital Expenditure" categories which affect valuation directly and should not be included in earnings projections
export const FundsSourceCapEx = [
  "product development",
  "division",
  "office",
  "warehouse",
  "upgrades",
  "bribery",
  "public equity",
  "private equity",
  "hacknet",
  "force majeure",
] as const;

// "Operating Expense" categories which should be included in earnings projections for valuation
export const FundsSourceOpEx = [
  "operating expenses",
  "operating revenue",
  "dividends",
  "tea",
  "parties",
  "advert",
  "materials",
] as const;

export type FundsSource = (typeof FundsSourceOpEx)[number] | (typeof FundsSourceCapEx)[number];
