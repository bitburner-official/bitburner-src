// The initial formulas was sum 0 to f of 500*1.02^f.
// see https://en.wikipedia.org/wiki/Geometric_series#Closed-form_formula
// for information on how to calculate this

export function favorToRep(f: number, base: number = 1.02): number {
  const raw = 25000 * (Math.pow(base, f) - 1);
  const rounded = Math.round(raw * 10000) / 10000; // round to make things easier.
  return Math.min(rounded, Number.MAX_VALUE);
}

export function repToFavor(r: number, base: number = 1.02): number {
  r = Math.min(r, Number.MAX_VALUE);
  const raw = Math.log(r / 25000 + 1) / Math.log(base);
  return Math.round(raw * 10000) / 10000; // round to make things easier.
}
