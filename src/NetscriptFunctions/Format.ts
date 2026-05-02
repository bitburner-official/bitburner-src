import { Format } from "@nsdefs";
import { InternalAPI } from "src/Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { formatNumber, formatPercent, formatRam } from "../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";

export function NetscriptFormat(): InternalAPI<Format> {
  return {
    number:
      (ctx) =>
      (_n, _fractionalDigits = 3, _suffixStart = 1000, isInteger) => {
        const n = helpers.number(ctx, "n", _n);
        const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
        const suffixStart = helpers.number(ctx, "suffixStart", _suffixStart);
        return formatNumber(n, fractionalDigits, suffixStart, !!isInteger);
      },
    ram:
      (ctx) =>
      (_n, _fractionalDigits = 2) => {
        const n = helpers.number(ctx, "n", _n);
        const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
        return formatRam(n, fractionalDigits);
      },
    percent:
      (ctx) =>
      (_n, _fractionalDigits = 2, _multStart = 1e6) => {
        const n = helpers.number(ctx, "n", _n);
        const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
        const multStart = helpers.number(ctx, "multStart", _multStart);
        return formatPercent(n, fractionalDigits, multStart);
      },
    time: (ctx) => (_milliseconds, _milliPrecision) => {
      const milliseconds = helpers.number(ctx, "milliseconds", _milliseconds);
      const milliPrecision = !!_milliPrecision;
      return convertTimeMsToTimeElapsedString(milliseconds, milliPrecision);
    },
  };
}
