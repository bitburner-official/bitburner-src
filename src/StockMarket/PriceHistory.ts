/**
 * Recent price history for each stock, kept in memory only.
 *
 * Deliberately not part of the save file. `Stock.toJSON` calls `Generic_toJSON` with no key list,
 * so every own property of a Stock is serialized - putting history on the class would silently add
 * it to every save. Keeping it in a module-level map instead means recording begins when a market
 * is created or loaded and the series is discarded when the page goes away.
 *
 * Points are raw per-tick prices rather than pre-aggregated bars, since bars (open/high/low/close,
 * for a candlestick view) can be derived from ticks but not the other way around.
 */
import { StockMarketConstants } from "./data/Constants";
import { Settings } from "../Settings/Settings";

/** How far back a stock's history reaches before its oldest points start being dropped. */
export function getPriceHistoryDurationMs(): number {
  return Settings.StockChartHistoryMinutes * 60 * 1000;
}

/**
 * Points retained per stock. A function, not a const: the duration is a live setting. Market
 * updates are wall-clock gated to no faster than `msPerStockUpdateMin`, so in practice a full
 * buffer covers somewhat more than the nominal duration, never less. The floor of 2 keeps a
 * nonsense setting (hand-edited save) from erasing the charts outright.
 */
export function getMaxPriceHistoryLength(): number {
  return Math.max(2, Math.round(getPriceHistoryDurationMs() / StockMarketConstants.msPerStockUpdate));
}

const emptyHistory: readonly number[] = [];

/**
 * Symbol -> prices, oldest first. Entries are replaced rather than mutated so consumers can use
 * reference equality to skip work: the Stock Market UI re-renders every game cycle (5Hz) but prices
 * only move once per market update.
 */
const priceHistories = new Map<string, readonly number[]>();

/**
 * Symbol -> how many points have been dropped off the front of its history. Gives every retained
 * point a stable absolute index (`offset + i`), which is what lets a candlestick view keep its
 * bucket boundaries fixed in time: bucketing by array position would shift every candle's window
 * each time the full buffer sheds a tick, morphing the whole chart once per update.
 */
const droppedCounts = new Map<string, number>();

export function recordStockPrice(symbol: string, price: number): void {
  // Guarded here rather than at the call sites so every recording path honors the setting,
  // including the reset paths' re-anchoring. The options UI wipes existing history on toggle.
  if (Settings.DisableStockPriceHistory) return;
  const previous = priceHistories.get(symbol) ?? emptyHistory;
  // Steady state drops at most one point, but lowering the duration setting mid-session can leave
  // a history arbitrarily far over the new bound. Excess points are trimmed here, lazily, on each
  // stock's next tick - until then a chart shows the longer series compressed into its width
  // (sparklineGeometry widens to fit when data outgrows capacity), which resolves within seconds.
  const dropCount = Math.max(0, previous.length - (getMaxPriceHistoryLength() - 1));
  const trimmed = dropCount === 0 ? previous : previous.slice(dropCount);
  if (dropCount > 0) droppedCounts.set(symbol, (droppedCounts.get(symbol) ?? 0) + dropCount);
  priceHistories.set(symbol, [...trimmed, price]);
}

/** Prices for `symbol`, oldest first. Empty until the first price has been recorded. */
export function getStockPriceHistory(symbol: string): readonly number[] {
  return priceHistories.get(symbol) ?? emptyHistory;
}

/**
 * Absolute index of the first retained point of `symbol`'s history - the number of points recorded
 * and since dropped. See {@link droppedCounts} for why a consumer would want this.
 */
export function getStockPriceHistoryOffset(symbol: string): number {
  return droppedCounts.get(symbol) ?? 0;
}

export function clearStockPriceHistories(): void {
  priceHistories.clear();
  droppedCounts.clear();
}
