import numeral from "numeral";
import { ThemeEvents } from "../Themes/ui/Theme";
import { EventEmitter } from "../utils/EventEmitter";
import { Settings } from "../Settings/Settings";

const log1000suffixes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n"];
const ramLog1000Suffixes = ["GB", "TB", "PB", "EB"];
const ramLog1024Suffixes = ["GiB", "TiB", "PiB", "EiB"];
let digitFormats = {} as Record<number, Intl.NumberFormat | undefined>;
let percentFormats = {} as Record<number, Intl.NumberFormat | undefined>;
let exponentialFormats = {} as Record<number, Intl.NumberFormat | undefined>;
let smallIntFormat: Intl.NumberFormat;
/** Event to be emitted when changing number display settings. */
export const FormatsNeedReset = new EventEmitter();
/** Event to be emitted after the cached formatters are cleared. */
export const FormatsReset = new EventEmitter();

FormatsNeedReset.subscribe(() => {
  // Clear all cached formatters
  digitFormats = {};
  percentFormats = {};
  exponentialFormats = {};
  // Regenerate the special smallIntFormat
  smallIntFormat = new Intl.NumberFormat([Settings.Locale, "en"]);
  // Emit a FormatsReset event so any dynamic content can be regenerated.
  FormatsReset.emit();
  // Force a redraw of the entire UI
  ThemeEvents.emit();
});
function makeFormatter(fractionalDigits: number, otherOptions: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  return new Intl.NumberFormat([Settings.Locale, "en"], {
    minimumFractionDigits: Settings.hideTrailingDecimalZeros ? 0 : fractionalDigits,
    maximumFractionDigits: fractionalDigits,
    // @ts-ignore using an experimental config that isn't in the ts for NumberFormatOptions.
    roundingMode: "trunc",
    ...otherOptions,
  });
}
function getFormatter(fractionalDigits: number, percent?: boolean, exponential?: boolean): Intl.NumberFormat {
  // Determine whether to use the cached normal formatters or the percentage formatters
  const baseFormats = percent ? percentFormats : exponential ? exponentialFormats : digitFormats;

  // Return cached formatter if it already exists
  if (baseFormats[fractionalDigits]) return baseFormats[fractionalDigits] as Intl.NumberFormat;

  // Make a new formatter and then return it.
  const formatterOptions: Intl.NumberFormatOptions = percent
    ? { style: "percent" }
    : { notation: exponential ? "scientific" : "standard" };
  return (baseFormats[fractionalDigits] = makeFormatter(fractionalDigits, formatterOptions));
}

type NFormatOptions = {
  suffixStart?: number;
  fractionalDigits?: number;
  isInt?: boolean;
  isPercent?: boolean;
  isRam?: boolean;
};
export function nFormatNew(n: number, options: NFormatOptions = {}) {
  // NaN does not get formatted
  if (Number.isNaN(n)) return "NaN";
  const nAbs = Math.abs(n);
  // Special handling for Infinities
  if (nAbs === Infinity) return n < 0 ? "-∞" : "∞";

  const suffixStart = options.suffixStart ?? 1000;
  const fractionalDigits = options.fractionalDigits ?? 3;
  // For percents or if less than the suffix, just format the number without doing suffixes
  if (options.isPercent) return getFormatter(fractionalDigits, true).format(n);
  // For less than suffixStart, what we return depends on whether it's an integer form.
  if (nAbs < suffixStart) {
    if (options.isInt) return smallIntFormat.format(n);
    return getFormatter(fractionalDigits).format(n);
  }

  const logBase = options.isRam && Settings.UseIEC60027_2 ? 1024 : 1000;
  const suffixList = options.isRam
    ? Settings.UseIEC60027_2
      ? ramLog1024Suffixes
      : ramLog1000Suffixes
    : log1000suffixes;
  const suffixIndex = Math.floor(Math.log(nAbs) / Math.log(logBase));
  // If there's no suffix use exponential
  if (!suffixList[suffixIndex]) return getFormatter(fractionalDigits, false, true).format(n).toLocaleLowerCase();
  // Suffixed form
  n /= logBase ** suffixIndex;
  return getFormatter(fractionalDigits).format(n) + suffixList[suffixIndex];
}

const extraFormats = [1e15, 1e18, 1e21, 1e24, 1e27, 1e30];
const extraNotations = ["q", "Q", "s", "S", "o", "n"];

export function nFormat(n: number | string, format?: string): string {
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

/** Format a number without suffixes */
export function formatNumber(n: number, fractionalDigits = 0): string {
  // Still use exponential if the number is too large certain size large
  return nFormatNew(n, { fractionalDigits, suffixStart: 1e33 });
}

/** Standard noninteger big number formatting */
export function formatBigNumber(n: number, fractionalDigits = 3): string {
  return nFormatNew(n, { fractionalDigits });
}

export function formatHp(n: number): string {
  return nFormatNew(n, { isInt: true, suffixStart: 1e6 });
}

export function formatMoney(n: number): string {
  return "$" + nFormatNew(n);
}

export function formatSkill(n: number): string {
  return nFormatNew(n, { isInt: true, suffixStart: 1e15 });
}

export const formatExp = nFormatNew;
export const formatHashes = nFormatNew;
export const formatReputation = nFormatNew;
export const formatSecurity = nFormatNew;
// Displaying with no suffixes
export const formatFavor = formatNumber;

export function formatRAM(n: number): string {
  return nFormatNew(n, { isRam: true, fractionalDigits: 2 });
}

export function formatPercentage(n: number, fractionalDigits = 2): string {
  return nFormatNew(n, { isPercent: true, fractionalDigits });
}

// Increased precision (5 fractional digits displayed)
export const formatRespect = (n: number) => nFormatNew(n, { fractionalDigits: 5 });
export const formatWanted = formatRespect;

// No suffix use, 2 fractional digits
export const formatMultiplier = (n: number) => formatNumber(n, 2);

// No suffix use, 3 fractional digits
export const formatSleeveShock = (n: number) => formatNumber(n, 3);
export const formatSleeveSynchro = formatSleeveShock;

// Data that is always a small int
export function formatSleeveMemory(n: number): string {
  return smallIntFormat.format(n);
}

export const formatPopulation = nFormatNew;
export const formatStamina = nFormatNew;

// Integer with default 1000 suffixStart
export const formatShares = (n: number) => nFormatNew(n, { isInt: true });

export const formatThreads = formatSleeveMemory;
export const formatStaneksGiftCharge = nFormatNew;
export const formatStaneksGiftPower = formatMultiplier;

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
