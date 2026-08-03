/**
 * Drift guard for the collapsed row's chart sizing. The row chart pads itself by the forecast
 * characters its row is missing, computed from forecastLength/maxForecastLength - so those two
 * must agree exactly with the +/- run the header actually prints, across the whole otlkMag range
 * the market can produce (Stock.cycleForecast clamps it to 50). If they ever disagree, the list's
 * all-or-none chart behavior quietly goes ragged instead of failing anywhere visible.
 */
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Player } from "@player";
import { StockSymbol } from "../../../src/Enums";
import { Stock } from "../../../src/StockMarket/Stock";
import {
  deleteStockMarket,
  initStockMarket,
  initSymbolToStockMap,
  SymbolToStockMap,
} from "../../../src/StockMarket/StockMarket";
import {
  forecastLength,
  maxForecastLength,
  StockTickerHeaderText,
} from "../../../src/StockMarket/ui/StockTickerHeaderText";
import { FormatsNeedToChange } from "../../../src/ui/formatNumber";

function trailingForecastRun(stock: Stock): string {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<StockTickerHeaderText stock={stock} />);
  const text = container.textContent ?? "";
  return /([+-]+)$/.exec(text)?.[1] ?? "";
}

describe("stock ticker header forecast run", () => {
  let stock: Stock;

  beforeAll(() => {
    FormatsNeedToChange.emit();
    initStockMarket();
    initSymbolToStockMap();
    Player.has4SData = true;
    stock = SymbolToStockMap[Object.values(StockSymbol)[0]];
  });

  afterAll(() => {
    Player.has4SData = false;
    deleteStockMarket();
  });

  it("matches forecastLength and stays within maxForecastLength across the otlkMag range", () => {
    // Whole and fractional magnitudes on both sides of every 10-boundary, both directions.
    for (let otlkMag = 0; otlkMag <= 50; otlkMag += 0.5) {
      for (const b of [true, false]) {
        stock.otlkMag = otlkMag;
        stock.b = b;
        const run = trailingForecastRun(stock);
        expect(run.length).toBe(forecastLength(stock));
        expect(run.length).toBeLessThanOrEqual(maxForecastLength);
        // The run is one repeated character; direction comes from b and the magnitude's sign.
        expect(run).toBe(run[0].repeat(run.length));
      }
    }
  });

  it("can never outgrow the header column, because cycleForecast clamps otlkMag", () => {
    stock.otlkMag = 49;
    stock.b = true;
    // cycleForecast branches on RNG internally, but the clamp at the end is unconditional - so
    // hammer it with huge swings and require the invariant to hold every time.
    for (let i = 0; i < 200; ++i) {
      stock.cycleForecast(500);
      expect(stock.otlkMag).toBeGreaterThanOrEqual(0);
      expect(stock.otlkMag).toBeLessThanOrEqual(50);
      expect(forecastLength(stock)).toBeLessThanOrEqual(maxForecastLength);
      expect(trailingForecastRun(stock)).toHaveLength(forecastLength(stock));
    }
  });
});
