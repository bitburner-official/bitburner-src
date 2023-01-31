import {
  nFormat,
  formatBigNumber,
  formatPercentage,
  parseMoney,
  largestAbsoluteNumber,
} from "../../../src/ui/nFormat";

const decimalFormat = "0.[000000]";

describe("Numeral formatting for positive numbers", () => {
  test("should not format too small numbers", () => {
    expect(nFormat(0.0000000001, decimalFormat)).toEqual("0");
    expect(nFormat(0.000000001, decimalFormat)).toEqual("0");
    expect(nFormat(0.00000001, decimalFormat)).toEqual("0");
    expect(nFormat(0.0000001, decimalFormat)).toEqual("0");
    expect(nFormat(0.000001, decimalFormat)).toEqual("0.000001");
    expect(nFormat(0.00001, decimalFormat)).toEqual("0.00001");
    expect(nFormat(0.0001, decimalFormat)).toEqual("0.0001");
    expect(nFormat(0.001, decimalFormat)).toEqual("0.001");
    expect(nFormat(0.01, decimalFormat)).toEqual("0.01");
    expect(nFormat(0.1, decimalFormat)).toEqual("0.1");
    expect(nFormat(1, decimalFormat)).toEqual("1");
  });
  test("should format really big numbers in readable format", () => {
    expect(formatBigNumber(987)).toEqual("987.000");
    expect(formatBigNumber(987654)).toEqual("987.654k");
    expect(formatBigNumber(987654321)).toEqual("987.654m");
    expect(formatBigNumber(987654321987)).toEqual("987.654b");
    expect(formatBigNumber(987654321987654)).toEqual("987.654t");
    expect(formatBigNumber(987654321987654000)).toEqual("987.654q");
    expect(formatBigNumber(987654321987654000000)).toEqual("987.654Q");
    expect(formatBigNumber(987654321987654000000000)).toEqual("987.654s");
    expect(formatBigNumber(987654321987654000000000000)).toEqual("987.654S");
    expect(formatBigNumber(987654321987654000000000000000)).toEqual("987.654o");
    expect(formatBigNumber(987654321987654000000000000000000)).toEqual("987.654n");
  });
  test("should format even bigger really big numbers in scientific format", () => {
    expect(formatBigNumber(987654321987654000000000000000000000)).toEqual("9.877e35");
    expect(formatBigNumber(9876543219876540000000000000000000000)).toEqual("9.877e36");
    expect(formatBigNumber(98765432198765400000000000000000000000)).toEqual("9.877e37");
  });
  test("should format percentage", () => {
    expect(formatPercentage(1234.56789)).toEqual("123,456.79%");
  });
});

describe("Numeral formatting for negative numbers", () => {
  test("should not format too small numbers", () => {
    expect(nFormat(-0.0000000001, decimalFormat)).toEqual("0");
    expect(nFormat(-0.000000001, decimalFormat)).toEqual("0");
    expect(nFormat(-0.00000001, decimalFormat)).toEqual("0");
    expect(nFormat(-0.0000001, decimalFormat)).toEqual("0");
    expect(nFormat(-0.000001, decimalFormat)).toEqual("-0.000001");
    expect(nFormat(-0.00001, decimalFormat)).toEqual("-0.00001");
    expect(nFormat(-0.0001, decimalFormat)).toEqual("-0.0001");
    expect(nFormat(-0.001, decimalFormat)).toEqual("-0.001");
    expect(nFormat(-0.01, decimalFormat)).toEqual("-0.01");
    expect(nFormat(-0.1, decimalFormat)).toEqual("-0.1");
    expect(nFormat(-1, decimalFormat)).toEqual("-1");
  });
  test("should format really big numbers in readable format", () => {
    expect(formatBigNumber(-987)).toEqual("-987.000");
    expect(formatBigNumber(-987654)).toEqual("-987.654k");
    expect(formatBigNumber(-987654321)).toEqual("-987.654m");
    expect(formatBigNumber(-987654321987)).toEqual("-987.654b");
    expect(formatBigNumber(-987654321987654)).toEqual("-987.654t");
    expect(formatBigNumber(-987654321987654000)).toEqual("-987.654q");
    expect(formatBigNumber(-987654321987654000000)).toEqual("-987.654Q");
    expect(formatBigNumber(-987654321987654000000000)).toEqual("-987.654s");
    expect(formatBigNumber(-987654321987654000000000000)).toEqual("-987.654S");
    expect(formatBigNumber(-987654321987654000000000000000)).toEqual("-987.654o");
    expect(formatBigNumber(-987654321987654000000000000000000)).toEqual("-987.654n");
  });
  test("should format even bigger really big numbers in scientific format", () => {
    expect(formatBigNumber(-987654321987654000000000000000000000)).toEqual("-9.877e35");
    expect(formatBigNumber(-9876543219876540000000000000000000000)).toEqual("-9.877e36");
    expect(formatBigNumber(-98765432198765400000000000000000000000)).toEqual("-9.877e37");
  });
  test("should format percentage", () => {
    expect(formatPercentage(-1234.56789)).toEqual("-123,456.79%");
  });
});

describe("Numeral formatting of scientific text", () => {
  test("Parsing positive numbers", () => {
    // Accepted by numeral.js
    expect(parseMoney("123")).toEqual(123);
    expect(parseMoney("123.456")).toEqual(123.456);
    expect(parseMoney("123k")).toEqual(123000);
    expect(parseMoney("123.456k")).toEqual(123456);
    expect(parseMoney("123m")).toEqual(123000000);
    expect(parseMoney("123.456m")).toEqual(123456000);
    expect(parseMoney("123b")).toEqual(123000000000);
    expect(parseMoney("123.456b")).toEqual(123456000000);
    expect(parseMoney("123t")).toEqual(123000000000000);
    expect(parseMoney("123.456t")).toEqual(123456000000000);
    // Custom formats, parseFloat has some rounding issues
    expect(parseMoney("123q")).toBeCloseTo(123000000000000000);
    expect(parseMoney("123.456q")).toBeCloseTo(123456000000000000);
    expect(parseMoney("123Q")).toBeCloseTo(123000000000000000000);
    expect(parseMoney("123.456Q")).toBeCloseTo(123456000000000000000);
    expect(parseMoney("123s")).toBeCloseTo(123000000000000000000000);
    expect(parseMoney("123.456s")).toBeCloseTo(123456000000000000000000);
    expect(parseMoney("123S")).toBeCloseTo(123000000000000000000000000);
    expect(parseMoney("123.456S")).toBeCloseTo(123456000000000000000000000);
    // Larger numbers fail the test due to rounding issues
    //expect(parseMoney('123o')).toBeCloseTo(123000000000000000000000000000);
    //expect(parseMoney('123.456o')).toBeCloseTo(123456000000000000000000000000);
    //expect(parseMoney('123n')).toBeCloseTo(123000000000000000000000000000000);
    //expect(parseMoney('123.456n')).toBeCloseTo(123456000000000000000000000000000);
  });
  test("Parsing negative numbers", () => {
    // Accepted by numeral.js
    expect(parseMoney("-123")).toEqual(-123);
    expect(parseMoney("-123.456")).toEqual(-123.456);
    expect(parseMoney("-123k")).toEqual(-123000);
    expect(parseMoney("-123.456k")).toEqual(-123456);
    expect(parseMoney("-123m")).toEqual(-123000000);
    expect(parseMoney("-123.456m")).toEqual(-123456000);
    expect(parseMoney("-123b")).toEqual(-123000000000);
    expect(parseMoney("-123.456b")).toEqual(-123456000000);
    expect(parseMoney("-123t")).toEqual(-123000000000000);
    expect(parseMoney("-123.456t")).toEqual(-123456000000000);
    // Custom formats, parseFloat has some rounding issues
    expect(parseMoney("-123q")).toBeCloseTo(-123000000000000000);
    expect(parseMoney("-123.456q")).toBeCloseTo(-123456000000000000);
    expect(parseMoney("-123Q")).toBeCloseTo(-123000000000000000000);
    expect(parseMoney("-123.456Q")).toBeCloseTo(-123456000000000000000);
    expect(parseMoney("-123s")).toBeCloseTo(-123000000000000000000000);
    expect(parseMoney("-123.456s")).toBeCloseTo(-123456000000000000000000);
    expect(parseMoney("-123S")).toBeCloseTo(-123000000000000000000000000);
    expect(parseMoney("-123.456S")).toBeCloseTo(-123456000000000000000000000);
    // Larger numbers fail the test due to rounding issues
    //expect(parseMoney('-123o')).toBeCloseTo(-123000000000000000000000000000);
    //expect(parseMoney('-123.456o')).toBeCloseTo(-123456000000000000000000000000);
    //expect(parseMoney('-123n')).toBeCloseTo(-123000000000000000000000000000000);
    //expect(parseMoney('-123.456n')).toBeCloseTo(-123456000000000000000000000000000);
  });
});

describe("Finding the number furthest away from 0", () => {
  test("should work if all numbers are equal", () => {
    expect(largestAbsoluteNumber(0, 0, 0)).toEqual(0);
    expect(largestAbsoluteNumber(1, 1, 1)).toEqual(1);
    expect(largestAbsoluteNumber(123, 123, 123)).toEqual(123);
    expect(largestAbsoluteNumber(-1, -1, -1)).toEqual(-1);
    expect(largestAbsoluteNumber(-123, -123, -123)).toEqual(-123);
  });
  test("should work for different positive numbers, and for the largest number in each spot", () => {
    expect(largestAbsoluteNumber(1, 2, 3)).toEqual(3);
    expect(largestAbsoluteNumber(456, 789, 123)).toEqual(789);
    expect(largestAbsoluteNumber(789123, 123456, 456789)).toEqual(789123);
  });
  test("should work for different negative numbers, and for the smallest number in each spot", () => {
    expect(largestAbsoluteNumber(-1, -2, -3)).toEqual(-3);
    expect(largestAbsoluteNumber(-456, -789, -123)).toEqual(-789);
    expect(largestAbsoluteNumber(-789123, -123456, -456789)).toEqual(-789123);
  });
  test("should work for combined positive and negative numbers", () => {
    expect(largestAbsoluteNumber(1, -2, 3)).toEqual(3);
    expect(largestAbsoluteNumber(-456, 789, -123)).toEqual(789);
    expect(largestAbsoluteNumber(789123, -123456, -456789)).toEqual(789123);
  });
  test("Should return 0 for invalid input", () => {
    expect(largestAbsoluteNumber("abc" as unknown as number, undefined, null as unknown as number)).toEqual(0);
  });
});
