import { ThemeEvents } from "../Themes/ui/Theme";
import { EventEmitter } from "../utils/EventEmitter";
import { Settings } from "../Settings/Settings";
import { NFormatOptions } from "@nsdefs";

const log1000suffixes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n"];
const ramLog1000Suffixes = ["GB", "TB", "PB", "EB"];
const ramLog1024Suffixes = ["GiB", "TiB", "PiB", "EiB"];
let digitFormats = {} as Record<number, Intl.NumberFormat | undefined>;
let percentFormats = {} as Record<number, Intl.NumberFormat | undefined>;
let basicFormatter: Intl.NumberFormat;
let exponentialFormatter: Intl.NumberFormat;

/** Event to be emitted when changing number display settings. */
export const FormatsNeedToChange = new EventEmitter();

/** Event to be emitted after the cached formatters are cleared. */
export const FormatsHaveChanged = new EventEmitter();

// Initialization function
FormatsNeedToChange.subscribe(() => {
  // Clear all cached formatters
  digitFormats = {};
  percentFormats = {};
  exponentialFormatter = makeFormatter(3, { notation: "scientific" });
  basicFormatter = new Intl.NumberFormat([Settings.Locale, "en"]);
  // Emit a FormatsHaveChanged event so any static content that uses formats can be regenerated.
  FormatsHaveChanged.emit();
  // Force a redraw of the entire UI
  ThemeEvents.emit();
});

/** Makes a new formatter */
function makeFormatter(fractionalDigits: number, otherOptions: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  return new Intl.NumberFormat([Settings.Locale, "en"], {
    minimumFractionDigits: Settings.hideTrailingDecimalZeros ? 0 : fractionalDigits,
    maximumFractionDigits: fractionalDigits,
    ...otherOptions,
  });
}
function getFormatter(fractionalDigits: number, percent?: boolean): Intl.NumberFormat {
  // Determine whether to use the cached normal formatters or the percentage formatters
  const baseFormats = percent ? percentFormats : digitFormats;

  // Return cached formatter if it already exists
  if (baseFormats[fractionalDigits]) return baseFormats[fractionalDigits] as Intl.NumberFormat;

  // Make a new formatter and then return it.
  const formatterOptions: Intl.NumberFormatOptions = percent ? { style: "percent" } : {};
  return (baseFormats[fractionalDigits] = makeFormatter(fractionalDigits, formatterOptions));
}

export function nFormat(n: number, options: NFormatOptions = {}) {
  // NaN does not get formatted
  if (Number.isNaN(n)) return "NaN";
  const nAbs = Math.abs(n);
  // Special handling for Infinities
  if (nAbs === Infinity) return n < 0 ? "-∞" : "∞";

  const suffixStart = options.suffixStart ?? 1000;
  const fractionalDigits = options.fractionalDigits ?? 3;
  // For percents or if less than the suffix, just format the number without doing suffixes
  if (options.specialFlag === "percent") return getFormatter(fractionalDigits, true).format(n);
  // For less than suffixStart, what we return depends on whether it's an integer form.
  if (nAbs < suffixStart) {
    if (options.specialFlag === "integer") return basicFormatter.format(n);
    return getFormatter(fractionalDigits).format(n);
  }

  const logBase = options.specialFlag === "ram" && Settings.UseIEC60027_2 ? 1024 : 1000;
  const suffixList =
    options.specialFlag === "ram"
      ? Settings.UseIEC60027_2
        ? ramLog1024Suffixes
        : ramLog1000Suffixes
      : log1000suffixes;
  let suffixIndex = Math.floor(Math.log(nAbs) / Math.log(logBase));
  // If there's no suffix and we're in ram formatting, use the highest available suffix.
  if (!suffixList[suffixIndex] && options.specialFlag === "ram") suffixIndex = suffixList.length - 1;
  // If there's no suffix use exponential
  if (!suffixList[suffixIndex]) return exponentialFormatter.format(n).toLocaleLowerCase();
  // Suffixed form
  n /= logBase ** suffixIndex;
  if (Math.abs(n) >= logBase - 1 + parseFloat("0." + "9".repeat(fractionalDigits)) && suffixList[suffixIndex + 1]) {
    suffixIndex += 1;
    n /= logBase;
  }
  return getFormatter(fractionalDigits).format(n) + suffixList[suffixIndex];
}

/** Format a number without suffixes. Still show exponential form if >= 1e33. */
export const formatNumber = (n: number, fractionalDigits = 0) => nFormat(n, { fractionalDigits, suffixStart: 1e33 });
export const formatFavor = formatNumber;

/** Standard noninteger formatting with no options set. Collapses to suffix at 1000 and shows 3 fractional digits. */
export const formatBigNumber = (n: number) => nFormat(n);
export const formatExp = formatBigNumber;
export const formatHashes = formatBigNumber;
export const formatReputation = formatBigNumber;
export const formatPopulation = formatBigNumber;
export const formatSecurity = formatBigNumber;
export const formatStamina = formatBigNumber;
export const formatStaneksGiftCharge = formatBigNumber;

/** Format a number with suffixes starting at 1000 and 2 fractional digits */
export const formatQuality = (n: number) => nFormat(n, { fractionalDigits: 2 });

/** Format an integer that uses suffixed form at 1000 and 3 fractional digits. */
export const formatInt = (n: number) => nFormat(n, { specialFlag: "integer" });
export const formatSleeveMemory = formatInt;
export const formatShares = formatInt;

/** Display an integer up to 999,999 before collapsing to suffixed form with 3 fractional digits */
export const formatHp = (n: number) => nFormat(n, { specialFlag: "integer", suffixStart: 1e6 });
export const formatThreads = formatHp;

/** Display an integer up to 999,999,999 before collapsing to suffixed form with 3 fractional digits */
export const formatSkill = (n: number) => nFormat(n, { specialFlag: "integer", suffixStart: 1e9 });

/** Display standard money formatting, including the preceding $. */
export const formatMoney = (n: number) => "$" + nFormat(n);

/** Display standard ram formatting. */
export const formatRam = (n: number) => nFormat(n, { specialFlag: "ram", fractionalDigits: 2, suffixStart: 0 });

/** Display a percentage with a configurable number of fractional digits. Percentages never collapse to suffix form. */
export const formatPercent = (n: number, fractionalDigits = 2) => {
  return nFormat(n, { specialFlag: "percent", fractionalDigits });
};

/** Display a decimal number with increased precision (5 fractional digits) */
export const formatRespect = (n: number) => nFormat(n, { fractionalDigits: 5 });
export const formatWanted = formatRespect;
export const formatPreciseMultiplier = formatRespect;

/** Format a number with no suffix and 1 fractional digit. */
export const formatMaterialSize = (n: number) => formatNumber(n, 1);

/** Format a number with no suffix and 2 fractional digits. */
export const formatMultiplier = (n: number) => formatNumber(n, 2);
export const formatStaneksGiftPower = formatMultiplier;
export const formatMatPurchaseAmount = formatMultiplier;

/** Format a number with no suffix and 3 fractional digits. */
export const formatSleeveShock = (n: number) => formatNumber(n, 3);
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

  const suffixIndex = log1000suffixes.indexOf(str.substring(str.length - 1));
  // If there's no valid suffix at the end, just return parseFloated string
  if (suffixIndex === -1) return parseFloat(str);
  return parseFloat(str.substring(0, str.length - 1) + "e" + suffixIndex * 3);
}
