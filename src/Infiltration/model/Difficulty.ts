interface DifficultySettings<T> {
  Trivial: T;
  Normal: T;
  Hard: T;
  Brutal: T;
}

// interpolates between 2 numbers.
function lerp(x: number, y: number, t: number): number {
  return (1 - t) * x + t * y;
}

// interpolates between 2 difficulties.
function lerpD<T extends Record<string, number>>(a: T, b: T, t: number): T {
  const out: Record<string, number> = {};
  for (const key of Object.keys(a)) {
    out[key] = lerp(a[key], b[key], t);
  }
  return out as T;
}

export function interpolate<T extends Record<string, number>>(settings: DifficultySettings<T>, n: number): T {
  if (n < 0) return lerpD(settings.Trivial, settings.Trivial, 0);
  if (n >= 0 && n < 1) return lerpD(settings.Trivial, settings.Normal, n);
  if (n >= 1 && n < 2) return lerpD(settings.Normal, settings.Hard, n - 1);
  if (n >= 2 && n < 3) return lerpD(settings.Hard, settings.Brutal, n - 2);
  return lerpD(settings.Brutal, settings.Brutal, 0);
}
