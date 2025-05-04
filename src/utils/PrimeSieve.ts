/** Implementation of Sieve of Eratosthenes
 * https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes*/
export function simpleSieve(max: number): Array<number> {
  const primes = new Array<number>();
  //The array of numbers to check if they're prime is left blank. Blank and resulting prime values are falsey, non-primes are marked truthy.
  const arr = Array(max);
  //We only need to check factors up to the square root of max
  for (let i = 2; i * i <= max; i++) {
    //and only the prime factors
    if (!arr[i]) {
      //and we can then mark off all subsequent multiples of that prime
      for (let p = i * i; p <= max; p += i) {
        arr[p] = 1;
      }
    }
  }
  //It should be faster to loop over the array again than to check factors all the way to max and mark primes at the same time.
  for (let i = 2; i <= max; i++) {
    if (!arr[i]) {
      primes.push(i);
    }
  }
  return primes;
}

/** Segmented Sieve of Eratosthenes to find primes across a large range
 * https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes#Segmented_sieve */
export function segmentedSieve(low: number, high: number): Array<number> {
  //0 and 1 are not checked, so are removed here.
  if (low < 2) {
    low = 2;
  }
  const primes = new Array<number>();
  //Only store the potential primes in the low to high range instead of 0 to high.
  const arr = new Array(high - low + 1);
  //Instead of comparing all primes<low and primes<high, we use a filtering prime list. Sqrt(high) is a convenient "mid point".
  const checks = simpleSieve(Math.ceil(Math.sqrt(high)));
  for (const i of checks) {
    //same logic as for the simple sieve to mark off multiples of identified primes, but we only start checking at the first multiple>low.
    const lim = Math.max(i, Math.ceil(low / i)) * i;
    for (let j = lim; j <= high; j += i) {
      arr[j - low] = 1;
    }
  }
  for (let a = 0; a < high - low + 1; a++) {
    if (!arr[a]) {
      primes.push(a + low);
    }
  }
  return primes;
}
