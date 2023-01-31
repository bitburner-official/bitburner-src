import numeral from "numeral";
import { Settings } from "../Settings/Settings";

const extraFormats = [1e15, 1e18, 1e21, 1e24, 1e27, 1e30];
const extraNotations = ["q", "Q", "s", "S", "o", "n"];
const gigaMultiplier = { standard: 1e9, iec60027_2: 2 ** 30 };

export function nFormat(n: number, format?: string): string {
  // numeral.js doesn't properly format numbers that are too big or too small
  if (Math.abs(n as number) < 1e-6) {
    n = 0;
  }
  const answer = numeral(n).format(format);
  if (answer === "NaN") {
    return `${n}`;
  }
  return answer;
}

// Formats a number with commas and a specific number of decimal digits
export function formatNumber(num: number, numFractionDigits = 0): string {
  return num.toLocaleString(undefined, {
    maximumFractionDigits: numFractionDigits,
    minimumFractionDigits: numFractionDigits,
  });
}

export function formatBigNumber(n: number): string {
  return nFormat(n, "0.000a");
}

export function formatReallyBigNumber(n: number, decimalPlaces = 3): string {
  const nAbs = Math.abs(n as number);
  if (n === Infinity) return "∞";
  for (let i = 0; i < extraFormats.length; i++) {
    if (extraFormats[i] <= nAbs && nAbs < extraFormats[i] * 1000) {
      return nFormat((n as number) / extraFormats[i], "0." + "0".repeat(decimalPlaces)) + extraNotations[i];
    }
  }
  if (nAbs < 1000) {
    return nFormat(n, "0." + "0".repeat(decimalPlaces));
  }
  const str = nFormat(n, "0." + "0".repeat(decimalPlaces) + "a");
  if (str === "NaNt") return nFormat(n, "0." + " ".repeat(decimalPlaces) + "e+0");
  return str;
}

export function formatHp(n: number): string {
  if (n < 1e6) {
    return nFormat(n, "0,0");
  }
  return formatReallyBigNumber(n);
}

export function formatMoney(n: number): string {
  return "$" + formatReallyBigNumber(n);
}

export function formatSkill(n: number): string {
  if (n < 1e15) {
    return nFormat(n, "0,0");
  }
  return formatReallyBigNumber(n);
}

export function formatExp(n: number): string {
  return formatReallyBigNumber(n);
}

export function formatHashes(n: number): string {
  return formatReallyBigNumber(n);
}

export function formatReputation(n: number): string {
  return formatReallyBigNumber(n);
}

export function formatFavor(n: number): string {
  return nFormat(n, "0,0");
}

export function formatSecurity(n: number): string {
  return nFormat(n, "0,0.000");
}

export function formatRAM(n: number): string {
  if (Settings.UseIEC60027_2) {
    return nFormat(n * gigaMultiplier.iec60027_2, "0.00ib");
  }
  return nFormat(n * gigaMultiplier.standard, "0.00b");
}

export function formatPercentage(n: number, decimalPlaces = 2): string {
  const formatter: string = "0." + "0".repeat(decimalPlaces) + "%";
  return nFormat(n, formatter);
}

export function formatRespect(n: number): string {
  return formatReallyBigNumber(n, 5);
}

export function formatWanted(n: number): string {
  return formatReallyBigNumber(n, 5);
}

export function formatMultiplier(n: number): string {
  return nFormat(n, "0,0.00");
}

export function formatSleeveShock(n: number): string {
  return nFormat(n, "0,0.000");
}

export function formatSleeveSynchro(n: number): string {
  return nFormat(n, "0,0.000");
}

export function formatSleeveMemory(n: number): string {
  return nFormat(n, "0");
}

export function formatPopulation(n: number): string {
  return formatReallyBigNumber(n);
}

export function formatStamina(n: number): string {
  return formatReallyBigNumber(n);
}

export function formatShares(n: number): string {
  if (n < 1000) {
    return nFormat(n, "0");
  }
  return formatReallyBigNumber(n);
}

export function formatThreads(n: number): string {
  return nFormat(n, "0,0");
}

export function formatStaneksGiftCharge(n: number): string {
  return nFormat(n, "0.000a");
}

export function formatStaneksGiftPower(n: number): string {
  return nFormat(n, "0.00");
}

export function parseCustomLargeNumber(str: string): number {
  const numericRegExp = new RegExp("^(-?\\d+\\.?\\d*)([" + extraNotations.join("") + "]?)$");
  const match = str.match(numericRegExp);
  if (match == null) {
    return NaN;
  }
  const [, number, notation] = match;
  const notationIndex = extraNotations.indexOf(notation);
  if (notationIndex === -1) {
    return NaN;
  }
  return parseFloat(number) * extraFormats[notationIndex];
}

export function largestAbsoluteNumber(n1: number, n2 = 0, n3 = 0): number {
  if (isNaN(n1)) n1 = 0;
  if (isNaN(n2)) n2 = 0;
  if (isNaN(n3)) n3 = 0;
  const largestAbsolute = Math.max(Math.abs(n1), Math.abs(n2), Math.abs(n3));
  switch (largestAbsolute) {
    case Math.abs(n1):
      return n1;
    case Math.abs(n2):
      return n2;
    case Math.abs(n3):
      return n3;
  }
  return 0;
}

export function parseMoney(s: string): number {
  // numeral library does not handle formats like 1s (returns 1) and 1e10 (returns 110) well,
  // so if more then 1 return a valid number, return the one farthest from 0
  const numeralValue = numeral(s).value();
  const parsed = parseFloat(s);
  const selfParsed = parseCustomLargeNumber(s);
  // Check for one or more NaN values
  if (isNaN(parsed) && isNaN(selfParsed)) {
    if (numeralValue === null) {
      // 3x NaN
      return NaN;
    }
    // 2x NaN
    return numeralValue;
  } else if (numeralValue === null && isNaN(selfParsed)) {
    // 2x NaN
    return parsed;
  } else if (isNaN(parsed)) {
    if (numeralValue === null) {
      // 2x NaN
      return selfParsed;
    }
    // 1x NaN
    return largestAbsoluteNumber(numeralValue, selfParsed);
  } else if (numeralValue === null) {
    // 1x NaN
    return largestAbsoluteNumber(parsed, selfParsed);
  } else if (isNaN(selfParsed)) {
    // 1x NaN
    return largestAbsoluteNumber(numeralValue, parsed);
  } else {
    // no NaN
    return largestAbsoluteNumber(numeralValue, parsed, selfParsed);
  }
}
