import { Settings } from "../../../src/Settings/Settings";
import {
  formatBigNumber,
  formatPercent,
  parseBigNumber,
  FormatsNeedToChange,
  formatNumber,
  formatRam,
} from "../../../src/ui/formatNumber";

describe("Suffix rounding test", () => {
  test("Rounding Test", () => {
    Settings.hideTrailingDecimalZeros = false;
    FormatsNeedToChange.emit();
    expect(formatNumber(0.99999999e12)).toEqual("1.000t");
    expect(formatNumber(-0.99999999e12)).toEqual("-1.000t");
  });
});

describe("Numeral formatting for positive numbers", () => {
  test("should not format too small numbers and should hide trailing zeroes if configured", () => {
    // Initial settings
    Settings.hideTrailingDecimalZeros = true;
    FormatsNeedToChange.emit();
    expect(formatNumber(0.0000000001, 6)).toEqual("0");
    expect(formatNumber(0.000000001, 6)).toEqual("0");
    expect(formatNumber(0.00000001, 6)).toEqual("0");
    expect(formatNumber(0.0000001, 6)).toEqual("0");
    expect(formatNumber(0.000001, 6)).toEqual("0.000001");
    expect(formatNumber(0.00001, 6)).toEqual("0.00001");
    expect(formatNumber(0.0001, 6)).toEqual("0.0001");
    expect(formatNumber(0.001, 6)).toEqual("0.001");
    expect(formatNumber(0.01, 6)).toEqual("0.01");
    expect(formatNumber(0.1, 6)).toEqual("0.1");
    expect(formatNumber(1, 6)).toEqual("1");
    Settings.hideTrailingDecimalZeros = false;
    FormatsNeedToChange.emit();
  });
  test("powers of 10 test for suffix form", () => {
    // Initial settings
    Settings.hideTrailingDecimalZeros = false;
    FormatsNeedToChange.emit();
    const suffixes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n"];
    for (let i = 0; i < suffixes.length; i++) {
      expect(formatNumber(parseFloat("1e" + i * 3))).toEqual("1.000" + suffixes[i]);
      expect(formatNumber(parseFloat("1e" + (i * 3 + 1)))).toEqual("10.000" + suffixes[i]);
      expect(formatNumber(parseFloat("1e" + (i * 3 + 2)))).toEqual("100.000" + suffixes[i]);
    }
  });
  test("should format really big numbers in readable format", () => {
    // Initial settings
    Settings.hideTrailingDecimalZeros = false;
    FormatsNeedToChange.emit();
    expect(formatBigNumber(987)).toEqual("987.000");
    expect(formatBigNumber(987654)).toEqual("987.654k");
    expect(formatBigNumber(987654321)).toEqual("987.654m");
    expect(formatBigNumber(987654321987)).toEqual("987.654b");
    expect(formatBigNumber(987654321987654)).toEqual("987.654t");
    expect(formatBigNumber(987654321987654e3)).toEqual("987.654q");
    expect(formatBigNumber(987654321987654e6)).toEqual("987.654Q");
    expect(formatBigNumber(987654321987654e9)).toEqual("987.654s");
    expect(formatBigNumber(987654321987654e12)).toEqual("987.654S");
    expect(formatBigNumber(987654321987654e15)).toEqual("987.654o");
    expect(formatBigNumber(987654321987654e18)).toEqual("987.654n");
  });
  test("should format even bigger really big numbers in scientific format", () => {
    expect(formatBigNumber(987654321987654e21)).toEqual("9.877e35");
    expect(formatBigNumber(987654321987654e22)).toEqual("9.877e36");
    expect(formatBigNumber(987654321987654e23)).toEqual("9.877e37");
  });
  test("should format percentage", () => {
    expect(formatPercent(1234.56789)).toEqual("123,456.79%");
  });
});

describe("Numeral formatting for negative numbers", () => {
  test("should not format too small numbers and should hide trailing zeroes if configured", () => {
    // Initial settings
    Settings.hideTrailingDecimalZeros = true;
    FormatsNeedToChange.emit();
    // No simple way right now to force 0 instead of -0
    expect(formatNumber(-0.0000000001, 6)).toEqual("-0");
    expect(formatNumber(-0.000000001, 6)).toEqual("-0");
    expect(formatNumber(-0.00000001, 6)).toEqual("-0");
    expect(formatNumber(-0.0000001, 6)).toEqual("-0");
    expect(formatNumber(-0.000001, 6)).toEqual("-0.000001");
    expect(formatNumber(-0.00001, 6)).toEqual("-0.00001");
    expect(formatNumber(-0.0001, 6)).toEqual("-0.0001");
    expect(formatNumber(-0.001, 6)).toEqual("-0.001");
    expect(formatNumber(-0.01, 6)).toEqual("-0.01");
    expect(formatNumber(-0.1, 6)).toEqual("-0.1");
    expect(formatNumber(-1, 6)).toEqual("-1");
  });
  test("powers of 10 test for suffix form", () => {
    // Initial settings
    Settings.hideTrailingDecimalZeros = false;
    FormatsNeedToChange.emit();
    const suffixes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n"];
    for (let i = 0; i < suffixes.length; i++) {
      expect(formatNumber(parseFloat("-1e" + i * 3))).toEqual("-1.000" + suffixes[i]);
      expect(formatNumber(parseFloat("-1e" + (i * 3 + 1)))).toEqual("-10.000" + suffixes[i]);
      expect(formatNumber(parseFloat("-1e" + (i * 3 + 2)))).toEqual("-100.000" + suffixes[i]);
    }
  });
  test("should format really big numbers in readable format", () => {
    // Initial settings
    Settings.hideTrailingDecimalZeros = false;
    FormatsNeedToChange.emit();
    expect(formatBigNumber(-987)).toEqual("-987.000");
    expect(formatBigNumber(-987654)).toEqual("-987.654k");
    expect(formatBigNumber(-987654321)).toEqual("-987.654m");
    expect(formatBigNumber(-987654321987)).toEqual("-987.654b");
    expect(formatBigNumber(-987654321987654)).toEqual("-987.654t");
    expect(formatBigNumber(-987654321987654e3)).toEqual("-987.654q");
    expect(formatBigNumber(-987654321987654e6)).toEqual("-987.654Q");
    expect(formatBigNumber(-987654321987654e9)).toEqual("-987.654s");
    expect(formatBigNumber(-987654321987654e12)).toEqual("-987.654S");
    expect(formatBigNumber(-987654321987654e15)).toEqual("-987.654o");
    expect(formatBigNumber(-987654321987654e18)).toEqual("-987.654n");
  });
  test("should format even bigger really big numbers in scientific format", () => {
    expect(formatBigNumber(-987654321987654e21)).toEqual("-9.877e35");
    expect(formatBigNumber(-987654321987654e22)).toEqual("-9.877e36");
    expect(formatBigNumber(-987654321987654e23)).toEqual("-9.877e37");
  });
  test("should format percentage", () => {
    expect(formatPercent(-1234.56789)).toEqual("-123,456.79%");
  });
});

describe("Numeral formatting of scientific text", () => {
  test("Parsing positive numbers", () => {
    // Accepted by numeral.js
    expect(parseBigNumber("123")).toEqual(123);
    expect(parseBigNumber("123.456")).toEqual(123.456);
    expect(parseBigNumber("123k")).toEqual(123e3);
    expect(parseBigNumber("123.456k")).toEqual(123456);
    expect(parseBigNumber("123m")).toEqual(123e6);
    expect(parseBigNumber("123.456m")).toEqual(123456e3);
    expect(parseBigNumber("123b")).toEqual(123e9);
    expect(parseBigNumber("123.456b")).toEqual(123456e6);
    expect(parseBigNumber("123t")).toEqual(123e12);
    expect(parseBigNumber("123.456t")).toEqual(123456e9);
    expect(parseBigNumber("123q")).toEqual(123e15);
    expect(parseBigNumber("123.456q")).toEqual(123456e12);
    expect(parseBigNumber("123Q")).toEqual(123e18);
    expect(parseBigNumber("123.456Q")).toEqual(123456e15);
    expect(parseBigNumber("123s")).toEqual(123e21);
    expect(parseBigNumber("123.456s")).toEqual(123456e18);
    expect(parseBigNumber("123S")).toEqual(123e24);
    expect(parseBigNumber("123.456S")).toEqual(123456e21);
    expect(parseBigNumber("123o")).toEqual(123e27);
    expect(parseBigNumber("123.456o")).toEqual(123456e24);
    expect(parseBigNumber("123n")).toEqual(123e30);
    expect(parseBigNumber("123.456n")).toEqual(123456e27);
  });
  test("Parsing negative numbers", () => {
    // Accepted by numeral.js
    expect(parseBigNumber("-123")).toEqual(-123);
    expect(parseBigNumber("-123.456")).toEqual(-123.456);
    expect(parseBigNumber("-123k")).toEqual(-123e3);
    expect(parseBigNumber("-123.456k")).toEqual(-123456);
    expect(parseBigNumber("-123m")).toEqual(-123e6);
    expect(parseBigNumber("-123.456m")).toEqual(-123456e3);
    expect(parseBigNumber("-123b")).toEqual(-123e9);
    expect(parseBigNumber("-123.456b")).toEqual(-123456e6);
    expect(parseBigNumber("-123t")).toEqual(-123e12);
    expect(parseBigNumber("-123.456t")).toEqual(-123456e9);
    expect(parseBigNumber("-123q")).toEqual(-123e15);
    expect(parseBigNumber("-123.456q")).toEqual(-123456e12);
    expect(parseBigNumber("-123Q")).toEqual(-123e18);
    expect(parseBigNumber("-123.456Q")).toEqual(-123456e15);
    expect(parseBigNumber("-123s")).toEqual(-123e21);
    expect(parseBigNumber("-123.456s")).toEqual(-123456e18);
    expect(parseBigNumber("-123S")).toEqual(-123e24);
    expect(parseBigNumber("-123.456S")).toEqual(-123456e21);
    expect(parseBigNumber("-123o")).toEqual(-123e27);
    expect(parseBigNumber("-123.456o")).toEqual(-123456e24);
    expect(parseBigNumber("-123n")).toEqual(-123e30);
    expect(parseBigNumber("-123.456n")).toEqual(-123456e27);
  });
});
describe("Ram formatting", () => {
  test("With default GB mode", () => {
    // Initial settings
    Settings.UseIEC60027_2 = false;
    Settings.hideTrailingDecimalZeros = false;
    FormatsNeedToChange.emit();
    // Base unit for ram is GB.
    expect(formatRam(1)).toEqual("1.00GB");
    expect(formatRam(1e3)).toEqual("1.00TB");
    expect(formatRam(1024)).toEqual("1.02TB");
    expect(formatRam(1e6)).toEqual("1.00PB");
    expect(formatRam(1048576)).toEqual("1.05PB");
    expect(formatRam(1e9)).toEqual("1.00EB");
    expect(formatRam(1073741824)).toEqual("1.07EB");
  });
  test("With GiB mode", () => {
    // Initial settings
    Settings.UseIEC60027_2 = true;
    Settings.hideTrailingDecimalZeros = false;
    FormatsNeedToChange.emit();
    // Base unit for ram is now GiB.
    expect(formatRam(1)).toEqual("1.00GiB");
    expect(formatRam(1e3)).toEqual("1,000.00GiB");
    expect(formatRam(1024)).toEqual("1.00TiB");
    expect(formatRam(1e6)).toEqual("976.56TiB");
    expect(formatRam(1048576)).toEqual("1.00PiB");
    expect(formatRam(1e9)).toEqual("953.67PiB");
    expect(formatRam(1073741824)).toEqual("1.00EiB");
  });
});
