import { ThemeEvents } from "../Themes/ui/Theme";
import { EventEmitter } from "../utils/EventEmitter";
import { Settings } from "../Settings/Settings";

const numberSuffixList = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n"];
// exponents associated with each suffix
const numberExpList = numberSuffixList.map((_, i) => parseFloat(`1e${i * 3}`));

// Ram suffixes
const ramLog1000Suffixes = ["GB", "TB", "PB", "EB"];
const ramLog1024Suffixes = ["GiB", "TiB", "PiB", "EiB"];

// Items that get initialized in the initializer function.
let digitFormats = {} as Record<number, Intl.NumberFormat | undefined>,
  percentFormats = {} as Record<number, Intl.NumberFormat | undefined>,
  basicFormatter: Intl.NumberFormat,
  exponentialFormatter: Intl.NumberFormat,
  ramSuffixList: string[],
  ramExpList: number[],
  ramLogFn: (n: number) => number,
  ramLogDivisor: number;

/** Event to be emitted when changing number display settings. */
export const FormatsNeedToChange = new EventEmitter();

/** Event to be emitted after the cached formatters are cleared. */
export const FormatsHaveChanged = new EventEmitter();

// Initialization function
FormatsNeedToChange.subscribe(() => {
  // Clear all cached formatters
  digitFormats = {};
  percentFormats = {};
  exponentialFormatter = makeFormatter(3, { notation: Settings.useEngineeringNotation ? "engineering" : "scientific" });
  basicFormatter = new Intl.NumberFormat([Settings.Locale, "en"], { useGrouping: !Settings.hideThousandsSeparator });
  [ramSuffixList, ramLogFn, ramLogDivisor] = Settings.UseIEC60027_2
    ? // log2 of 1024 is 10 as divisor for log base 1024
      [ramLog1024Suffixes, Math.log2, 10]
    : // log10 of 1000 is 3 as divisor for log base 1000
      [ramLog1000Suffixes, Math.log10, 3];
  ramExpList = ramSuffixList.map((_, i) => (Settings.UseIEC60027_2 ? 1024 : 1000) ** i);

  // Emit a FormatsHaveChanged event so any static content that uses formats can be regenerated.
  FormatsHaveChanged.emit();
  // Force a redraw of the entire UI
  ThemeEvents.emit();
});

/** Makes a new formatter */
function makeFormatter(fractionalDigits: number, otherOptions: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  if (Settings.hideThousandsSeparator) otherOptions.useGrouping = false;
  return new Intl.NumberFormat([Settings.Locale, "en"], {
    minimumFractionDigits: Settings.hideTrailingDecimalZeros ? 0 : fractionalDigits,
    maximumFractionDigits: fractionalDigits,
    ...otherOptions,
  });
}
/** Returns a cached formatter if it already exists, otherwise makes and returns a new formatter */
function getFormatter(
  fractionalDigits: number,
  formatList = digitFormats,
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  if (formatList[fractionalDigits]) return formatList[fractionalDigits] as Intl.NumberFormat;
  return (formatList[fractionalDigits] = makeFormatter(fractionalDigits, options));
}

/** Display standard ram formatting. */
export function formatRam(n: number, fractionalDigits = 2) {
  // NaN does not get formatted
  if (Number.isNaN(n)) return `NaN${ramSuffixList[0]}`;
  const nAbs = Math.abs(n);

  // Special handling for Infinities
  if (nAbs === Infinity) return `${n < 0 ? "-∞" : ""}∞${ramSuffixList.at(-1)}`;

  // Early return if using first suffix.
  if (nAbs < 1000) return getFormatter(fractionalDigits).format(n) + ramSuffixList[0];

  // Ram always uses a suffix and never goes to exponential
  const suffixIndex = Math.min(Math.floor(ramLogFn(nAbs) / ramLogDivisor), ramSuffixList.length - 1);
  n /= ramExpList[suffixIndex];
  /* Not really concerned with 1000-rounding or 1024-rounding for ram due to the actual values ram gets displayed at.
  If display of e.g. 1,000.00GB instead of 1.00TB for 999.995GB, or 1,024.00GiB instead of 1.00TiB for 1,023.995GiB
  becomes an actual issue we can add smart rounding, but ram values like that really don't happen ingame so it's
  probably not worth the performance overhead to check and correct these. */
  return getFormatter(fractionalDigits).format(n) + ramSuffixList[suffixIndex];
}

function formatExponential(n: number) {
  return exponentialFormatter.format(n).toLocaleLowerCase();
}

// Default suffixing starts at 1e9 % which is 1e7.
export function formatPercent(n: number, fractionalDigits = 2, multStart = 1e6) {
  // NaN does not get formatted
  if (Number.isNaN(n)) return "NaN%";
  const nAbs = Math.abs(n);

  // Special handling for Infinities
  if (nAbs * 100 === Infinity) return n < 0 ? "-∞%" : "∞%";

  // Mult form. There are probably some areas in the game this wouldn't make sense, but they hopefully won't ever have huge %.
  if (nAbs >= multStart) return "x" + formatNumber(n, fractionalDigits);

  return getFormatter(fractionalDigits, percentFormats, { style: "percent" }).format(n);
}

export function formatNumber(n: number, fractionalDigits = 3, suffixStart = 1000, isInteger = false) {
  // NaN does not get formatted
  if (Number.isNaN(n)) return "NaN";
  const nAbs = Math.abs(n);

  // Special handling for Infinities
  if (nAbs === Infinity) return n < 0 ? "-∞" : "∞";
  if (suffixStart < 1000) {
    throw new Error("suffixStart must be greater than or equal to 1000");
  }

  // Early return for non-suffix or if number and suffix are 0
  if (nAbs < suffixStart) {
    if (isInteger) return basicFormatter.format(n);
    return getFormatter(fractionalDigits).format(n);
  }

  // Exponential form
  if (Settings.disableSuffixes || nAbs >= 1e33) return formatExponential(n);

  // Calculate suffix index. 1000 = 10^3
  let suffixIndex = Math.floor(Math.log10(nAbs) / 3);

  n /= numberExpList[suffixIndex];
  // Todo: Find a better way to detect if number is rounding to 1000${suffix}, or find a simple way to truncate to x digits instead of rounding
  // Detect if number rounds to 1000.000 (based on number of digits given)
  if (Math.abs(n).toFixed(fractionalDigits).length === fractionalDigits + 5 && numberSuffixList[suffixIndex + 1]) {
    suffixIndex += 1;
    n = n < 0 ? -1 : 1;
  }
  return getFormatter(fractionalDigits).format(n) + numberSuffixList[suffixIndex];
}

/** Format a number without suffixes. Still show exponential form if >= 1e33. */
export const formatNumberNoSuffix = (n: number, fractionalDigits = 0) => {
  return formatNumber(n, fractionalDigits, 1e33);
};
export const formatFavor = formatNumberNoSuffix;

/** Standard noninteger formatting with no options set. Collapses to suffix at 1000 and shows 3 fractional digits. */
export const formatBigNumber = (n: number) => formatNumber(n);
export const formatExp = formatBigNumber;
export const formatHashes = (n: number) => {
  if (n < 0.00001) {
    return formatNumber(n, 8);
  }
  if (n < 0.001) {
    return formatNumber(n, 6);
  }
  if (n < 0.01) {
    return formatNumber(n, 4);
  }
  return formatNumber(n);
};
export const formatReputation = formatBigNumber;
export const formatPopulation = formatBigNumber;
export const formatSecurity = formatBigNumber;
export const formatStamina = formatBigNumber;
export const formatStaneksGiftCharge = formatBigNumber;
export const formatCorpMultiplier = (n: number) => "×" + formatBigNumber(n);

/** Format a number with suffixes starting at 1000 and 2 fractional digits */
export const formatQuality = (n: number) => formatNumber(n, 2);

/** Format an integer that uses suffixed form at 1000 and 3 fractional digits. */
export const formatInt = (n: number) => formatNumber(n, 3, 1000, true);
export const formatSleeveMemory = formatInt;
export const formatShares = formatInt;

/** Display an integer up to 999,999 before collapsing to suffixed form with 3 fractional digits */
export const formatHp = (n: number) => formatNumber(n, 3, 1e6, true);
export const formatThreads = formatHp;

/** Display an integer up to 999,999,999 before collapsing to suffixed form with 3 fractional digits */
export const formatSkill = (n: number) => formatNumber(n, 3, 1e9, true);

/** Display standard money formatting, including the preceding $. */
export const formatMoney = (n: number) => "$" + formatNumber(n);

/** Display a decimal number with increased precision (5 fractional digits) */
export const formatRespect = (n: number) => formatNumber(n, 5);
export const formatWanted = formatRespect;
export const formatPreciseMultiplier = formatRespect;

/** Format a number with 3 fractional digits. */
export const formatMaterialSize = (n: number) => formatNumber(n, 3);

/** Format a number with no suffix and 2 fractional digits. */
export const formatMultiplier = (n: number) => formatNumberNoSuffix(n, 2);
export const formatStaneksGiftPower = formatMultiplier;
export const formatMatPurchaseAmount = formatMultiplier;

/** Format a number with no suffix and 3 fractional digits. */
export const formatSleeveShock = (n: number) => formatNumberNoSuffix(n, 3);
export const formatSleeveSynchro = formatSleeveShock;
export const formatCorpStat = formatSleeveShock;

/** Parsing numbers does not use the locale as this causes complications. */
export function parseBigNumber(str: string): number {
  str = str.trim();
  // Remove all commas in case the player is typing a longform number
  str = str.replace(/,/g, "");
  // Handle special returns
  if (["infinity", "Infinity", "∞"].includes(str)) return Infinity;
  if (["-infinity", "-Infinity", "-∞"].includes(str)) return -Infinity;

  const suffixIndex = numberSuffixList.indexOf(str.substring(str.length - 1));
  // If there's no valid suffix at the end, just return parseFloated string
  if (suffixIndex === -1) return parseFloat(str);
  return parseFloat(str.substring(0, str.length - 1) + "e" + suffixIndex * 3);
}
