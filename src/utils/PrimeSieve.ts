/** Implementation of Sieve of Eratosthenes
 * https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes*/
export function simpleSieve(max: number): Set<number> {
  const primes = new Set<number>();
  const arr = new Array(max);
  for (let i = 2; i <= max; i++) {
    if (!arr[i]) {
      primes.add(i);
      for (let p = i * i; p <= max; p += i) {
        arr[p] = 1;
      }
    }
  }
  return primes;
}

/** Segmented Sieve to better find primes in a large range
 * https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes#Segmented_sieve */
export function segmentedSieve(low: number, high: number): Set<number> {
  const primes = new Set<number>();
  const arr = new Array(high - low + 1);
  const checks = simpleSieve(Math.ceil(Math.sqrt(high)));
  for (const i of checks) {
    for (let j = Math.max(i, Math.ceil(low / i)) * i; j <= high; j += i) {
      arr[j - low] = true;
    }
  }
  for (let a = 0; a < high - low + 1; a++) {
    if (!arr[a]) {
      primes.add(a + low);
    }
  }
  if (low === 1) {
    primes.delete(1);
  }
  return primes;
}
