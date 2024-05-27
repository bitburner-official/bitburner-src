// The initial formulas was sum 0 to f of 500*1.02^f.
// see https://en.wikipedia.org/wiki/Geometric_series#Closed-form_formula
// for information on how to calculate this

import { clampNumber } from "../../utils/helpers/clampNumber";

export const MaxFavor = 35331;

export function favorToRep(f: number): number {
  return clampNumber(25000 * (Math.pow(1.02, f) - 1), 0);
}

export function repToFavor(r: number): number {
  return clampNumber(Math.log(r / 25000 + 1) / Math.log(1.02), 0, MaxFavor);
}

export function calculateFavorAfterResetting(favor: number, playerReputation: number) {
  return repToFavor(favorToRep(favor) + playerReputation);
}
