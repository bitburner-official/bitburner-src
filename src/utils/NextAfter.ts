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
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, x, true);
  // We use Int32 for convenience of the test below. Because storage in
  // TypedArrays is wrapping and we are only doing addition, signed/unsigned
  // does not matter.
  const u0 = view.getInt32(0, true);
  // We can't underflow 0 or overflow here, because 0 is 0.0 (already checked
  // for), and the max value is NaN (already checked for).
  if (x < y === x > 0) {
    view.setInt32(0, u0 + 1, true);
    if (u0 === -1) {
      view.setInt32(4, view.getInt32(4, true) + 1, true);
    }
  } else {
    view.setInt32(0, u0 - 1, true);
    if (u0 === 0) {
      view.setInt32(4, view.getInt32(4, true) - 1, true);
    }
  }
  return view.getFloat64(0, true);
}
