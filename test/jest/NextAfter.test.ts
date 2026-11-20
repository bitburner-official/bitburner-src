import { nextafter } from "../../src/utils/NextAfter";

function zero_pad(x: string) {
  return "0".repeat(8 - x.length) + x;
}

// Because we are dealing with specific binary values, the data is specified
// as hex strings.
test.each([
  ["0000000000000000", "0000000000000000", "0000000000000000"], // 0, 0 -> 0
  ["8000000000000000", "0000000000000000", "0000000000000000"], // -0, 0 -> 0
  ["0000000000000000", "8000000000000000", "8000000000000000"], // 0, -0 -> -0
  ["8000000000000000", "8000000000000000", "8000000000000000"], // -0, -0 -> -0
  ["fff0000000000001", "3ff0000000000000", "fff0000000000001"], // NaN, 1 -> NaN
  ["4000000000000000", "7ff0000000000002", "7ff0000000000002"], // 2, NaN -> NaN
  ["7ff0000000000003", "fff0000000000004", "7ff0000000000003"], // NaN, NaN -> NaN
  ["7ff0000000000000", "7ff0000000000000", "7ff0000000000000"], // inf, inf -> inf
  ["fff0000000000000", "fff0000000000000", "fff0000000000000"], // -inf, -inf -> -inf
  ["fff0000000000000", "7ff0000000000000", "ffefffffffffffff"], // -inf, inf -> -Big
  ["7ff0000000000000", "fff0000000000000", "7fefffffffffffff"], // inf, -inf -> Big
  ["0000000000000000", "7ff0000000000000", "0000000000000001"], // 0, inf -> Small
  ["8000000000000000", "7ff0000000000000", "0000000000000001"], // -0, inf -> Small
  ["0000000000000000", "fff0000000000000", "8000000000000001"], // 0, -inf -> -Small
  ["8000000000000000", "fff0000000000000", "8000000000000001"], // -0, -inf -> -Small
  ["3fefffffffffffff", "3ff0000000000000", "3ff0000000000000"], // .999_, 1 -> 1
  ["3fefffffffffffff", "bff0000000000000", "3feffffffffffffe"], // .999_, -1 -> .999__
  ["bfefffffffffffff", "3ff0000000000000", "bfeffffffffffffe"], // -.999_, 1 -> -.999__
  ["bfefffffffffffff", "bff0000000000000", "bff0000000000000"], // -.999_, -1 -> -1
])("nextafter test(%s, %s)", (x, y, expected) => {
  // Endianness: We write numbers big-endian, but they are stored little-endian.
  const u32 = Uint32Array.of(
    parseInt(x.slice(8), 16),
    parseInt(x.slice(0, 8), 16),
    parseInt(y.slice(8), 16),
    parseInt(y.slice(0, 8), 16),
  );
  const f64 = new Float64Array(u32.buffer);
  f64[0] = nextafter(f64[0], f64[1]);
  const result = zero_pad(u32[1].toString(16)) + zero_pad(u32[0].toString(16));
  expect(result).toBe(expected);
});
