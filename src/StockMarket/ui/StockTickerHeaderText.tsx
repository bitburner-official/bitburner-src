/**
 * React Component for the text on a stock ticker's header. This text displays
 * general information on the stock such as the name, symbol, price, and
 * 4S Market Data
 */
import * as React from "react";

import { Stock } from "../Stock";
import { TickerHeaderFormatData } from "../data/TickerHeaderFormatData";

import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { formatMoney, formatPercent } from "../../ui/formatNumber";
import Typography from "@mui/material/Typography";
import { getDarknetVolatilityMult } from "../../DarkNet/effects/effects";
import { clampNumber } from "../../utils/helpers/clampNumber";

interface IProps {
  stock: Stock;
}

const localesWithLongPriceFormat = ["cs", "lv", "pl", "ru"];

/**
 * Characters of `+`/`-` this stock's forecast is printed with. The only field of the header whose
 * width varies from row to row - everything before it is padded to a fixed column.
 */
export function forecastLength(stock: Stock): number {
  return Math.floor(Math.abs(stock.otlkMag) / 10) + 1;
}

/** Widest that field can get: `Stock.cycleForecast` clamps `otlkMag` to 50. */
export const maxForecastLength = 6;

export function StockTickerHeaderText(props: IProps): React.ReactElement {
  const stock = props.stock;

  const stockPriceFormat = formatMoney(stock.price);
  const spacesAllottedForStockPrice = localesWithLongPriceFormat.includes(Settings.Locale) ? 15 : 12;
  const spacesAfterStockName = " ".repeat(
    1 +
      TickerHeaderFormatData.longestName -
      stock.name.length +
      (TickerHeaderFormatData.longestSymbol - stock.symbol.length),
  );
  const spacesBeforePrice = " ".repeat(clampNumber(spacesAllottedForStockPrice - stockPriceFormat.length, 0));

  let hdrText = `${stock.name}${spacesAfterStockName}${stock.symbol} -${spacesBeforePrice}${stockPriceFormat}`;
  if (Player.has4SData) {
    const volatility = stock.mv * getDarknetVolatilityMult(stock.symbol);
    hdrText += ` - Volatility: ${formatPercent(volatility / 100)} - Price Forecast: `;
    let plusOrMinus = stock.b; // True for "+", false for "-"
    if (stock.otlkMag < 0) {
      plusOrMinus = !plusOrMinus;
    }
    hdrText += (plusOrMinus ? "+" : "-").repeat(forecastLength(stock));
  }

  let color = Settings.theme.success;
  if (stock.lastPrice === stock.price) {
    color = Settings.theme.secondary;
  } else if (stock.lastPrice > stock.price) {
    color = Settings.theme.error;
  }

  return (
    <Typography style={{ whiteSpace: "pre" }} color={color}>
      {hdrText}
    </Typography>
  );
}
