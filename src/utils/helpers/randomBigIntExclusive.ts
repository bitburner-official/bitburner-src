/**
 * Return a uniform random number in [0, size).
 * Adjusting the range can be done with addition. Because bigints are more
 * expensive, it makes more sense to have the 0-based version as a primitive.
 */
export function randomBigIntExclusive(size: bigint): bigint {
  // Sadly, the easiest/most efficient way to operate on bigints bitwise is to
  // deal with the hex string representation. In particular, this is the
  // fastest general way to find the size (number of bits) of the bigint.
  const bits = size.toString(16);
  if (bits.length <= 12) {
    // bigint is at most 48 bits. We can resolve this with a single random()
    // call, and that will save special cases below.
    return BigInt(Math.floor(Math.random() * Number(size)));
  }
  // We add 1 to the highest-order random digits, to ensure we cover the
  // entire range. If we end up getting a number that is too big we toss it
  // and try again. This seems wasteful, but it's actually one of the only
  // ways to get a truly uniform result. Since the high-order part is > 2^44
  // by the nature of it having 12 hex digits, we will need to restart at
  // *most* 2^-44 of the time, in the pathological cases.
  const highpart = parseInt(bits.slice(0, 12), 16) + 1;
  let result: bigint;
  do {
    let str = "0x" + Math.floor(Math.random() * highpart).toString(16);
    let i = 12;
    for (; i + 12 < bits.length; i += 12) {
      str += Math.floor(Math.random() * 2 ** 48).toString(16);
    }
    // Have to be careful to avoid 32-bit integer shift limit
    // By the logic above, this shift will always be > 0, and so we're always
    // adding at least one hex digit.
    const halfmul = 1 << (2 * (bits.length - i));
    str += Math.floor(Math.random() * halfmul * halfmul).toString(16);
    result = BigInt(str);
  } while (result >= size);
  return result;
}
