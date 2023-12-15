// Funds transactions which affect valuation directly and should not be included in earnings projections.
// This includes capital expenditures (which may be recoupable), time-limited actions, and transfers to/from other game mechanics.
const FundsSourceLongTerm = [
  "product development",
  "office",
  "warehouse",
  "upgrades",
  "bribery",
  "public equity",
  "private equity",
  "hacknet",
  "force majeure",
] as const;

// Funds transactions which should be included in earnings projections for valuation.
// This includes all automatic or indefinetly-repeatable income and operating expenses.
type FundsSourceShortTerm =
  | "division"
  | "operating expenses"
  | "operating revenue"
  | "dividends"
  | "tea"
  | "parties"
  | "advert"
  | "materials"
  | "glitch in reality";

export type FundsSource = (typeof FundsSourceLongTerm)[number] | FundsSourceShortTerm;

export const LongTermFundsSources = new Set<FundsSource>(FundsSourceLongTerm);
