// This is an implementation of the C/C++ function nextafter from the standard
// math library. JS doesn't have an analogue to it. It returns the next value
// after x in the direction of y. There are a number of interesting edge
// cases, so this is more-or-less reimplemented straight from the C library.
export function nextafter(x: number, y: number): number {
  if (Number.isNaN(x)) {
    return x;
  }
  if (Number.isNaN(y)) {
    return y;
  }
  if (x === y) {
    // Subtle -0 case here.
    return y;
  }
  if (x === 0) {
    // y can't be 0, from above
    return y > 0 ? Number.MIN_VALUE : -Number.MIN_VALUE;
  }
  const f64 = Float64Array.of(x, y);
  const u32 = new Uint32Array(f64.buffer);
  // We can't underflow 0 or overflow here, because 0 is 0.0 (already checked
  // for), and the max value is NaN (already checked for).
  if (x < y === x > 0) {
    if (u32[0] === -1 >>> 0) {
      u32[0] = 0;
      u32[1]++;
    } else {
      u32[0]++;
    }
  } else {
    if (u32[0] === 0) {
      u32[0] = -1 >>> 0;
      u32[1]--;
    } else {
      u32[0]--;
    }
  }
  return f64[0];
}
