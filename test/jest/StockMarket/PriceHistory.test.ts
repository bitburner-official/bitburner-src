/**
 * Proof that the in-memory stock price history (src/StockMarket/PriceHistory.ts) stays bounded
 * over long sessions, is cleared and re-anchored by every reset path, never reaches a save file,
 * and replaces its arrays rather than mutating them (the Sparkline memo compares by reference).
 *
 * The market is driven as a black box: through the same entry points the game loop and save
 * system use (processStockPrices, init/load/deleteStockMarket), observing history only through
 * getStockPriceHistory. recordStockPrice is deliberately never called directly.
 *
 * The default soak span is chosen for suite speed; set STOCK_SOAK=1 to simulate a full 14-day
 * session (~200k market ticks). Every tick past the first fill exercises the same trim-and-append
 * transition, so the short default loses no coverage, only endurance.
 */
import { CONSTANTS } from "../../../src/Constants";
import { StockSymbol } from "../../../src/Enums";
import {
  getMaxPriceHistoryLength,
  getPriceHistoryDurationMs,
  getStockPriceHistory,
} from "../../../src/StockMarket/PriceHistory";
import { Settings } from "../../../src/Settings/Settings";
import { Stock } from "../../../src/StockMarket/Stock";
import {
  deleteStockMarket,
  initStockMarket,
  initSymbolToStockMap,
  loadStockMarket,
  processStockPrices,
  StockMarket,
  SymbolToStockMap,
} from "../../../src/StockMarket/StockMarket";
import { StockMarketConstants } from "../../../src/StockMarket/data/Constants";

const symbols: string[] = Object.values(StockSymbol);
const cyclesPerTick = StockMarketConstants.msPerStockUpdate / CONSTANTS.MilliPerCycle;
/**
 * The retention bound is a live setting now; this captures it under the default settings, which is
 * what every test except the duration-lowering one runs with.
 */
const maxPriceHistoryLength = getMaxPriceHistoryLength();

/** Advance the mocked wall clock past the msPerStockUpdateMin gate and process exactly one market update. */
function advanceOneTick(): void {
  jest.setSystemTime(Date.now() + StockMarketConstants.msPerStockUpdate);
  processStockPrices(cyclesPerTick);
}

function advanceTicks(count: number): void {
  for (let i = 0; i < count; ++i) advanceOneTick();
}

function totalRetainedPoints(): number {
  return symbols.reduce((sum, symbol) => sum + getStockPriceHistory(symbol).length, 0);
}

/** The stocks currently in the market. Reads StockMarket directly because loadStockMarket replaces the objects. */
function marketStocks(): Stock[] {
  return Object.values(StockMarket).filter((value): value is Stock => value instanceof Stock);
}

describe("stock price history", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    deleteStockMarket();
    initStockMarket();
    initSymbolToStockMap();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("records one point per symbol per market update", () => {
    expect(symbols.length).toBeGreaterThan(0);
    for (const symbol of symbols) {
      expect(getStockPriceHistory(symbol)).toEqual([SymbolToStockMap[symbol].price]);
    }
    advanceTicks(3);
    for (const symbol of symbols) {
      const history = getStockPriceHistory(symbol);
      expect(history).toHaveLength(4);
      expect(history[history.length - 1]).toBe(SymbolToStockMap[symbol].price);
    }
  });

  it("keeps every symbol bounded and the total flat over a long soak", () => {
    const fourteenDaysTicks = Math.ceil((14 * 24 * 60 * 60 * 1000) / StockMarketConstants.msPerStockUpdate);
    const defaultSoakTicks = 3 * maxPriceHistoryLength + 2 * StockMarketConstants.TicksPerCycle;
    const soakTicks = process.env.STOCK_SOAK ? fourteenDaysTicks : defaultSoakTicks;
    const fullTotal = symbols.length * maxPriceHistoryLength;

    // Plain checks inside the loop: millions of expect() calls would dominate the runtime.
    for (let tick = 1; tick <= soakTicks; ++tick) {
      advanceOneTick();
      for (const symbol of symbols) {
        const length = getStockPriceHistory(symbol).length;
        if (length > maxPriceHistoryLength) {
          throw new Error(`history for ${symbol} reached ${length} points at tick ${tick}`);
        }
      }
      // init anchored one point before the first tick, so buffers are full from tick maxPriceHistoryLength - 1.
      if (tick >= maxPriceHistoryLength - 1) {
        const total = totalRetainedPoints();
        if (total !== fullTotal) {
          throw new Error(`total retained points ${total} != ${fullTotal} at tick ${tick}`);
        }
      }
    }
    for (const symbol of symbols) {
      expect(getStockPriceHistory(symbol)).toHaveLength(maxPriceHistoryLength);
    }
  }, 300_000);

  it("retains at least the nominal duration", () => {
    expect(maxPriceHistoryLength * StockMarketConstants.msPerStockUpdate).toBeGreaterThanOrEqual(
      getPriceHistoryDurationMs(),
    );
  });

  it("trims down within one tick per stock when the duration setting is lowered", () => {
    advanceTicks(maxPriceHistoryLength + 5);
    for (const symbol of symbols) {
      expect(getStockPriceHistory(symbol)).toHaveLength(maxPriceHistoryLength);
    }

    const originalMinutes = Settings.StockChartHistoryMinutes;
    try {
      Settings.StockChartHistoryMinutes = Math.max(1, Math.floor(originalMinutes / 3));
      const loweredLength = getMaxPriceHistoryLength();
      expect(loweredLength).toBeLessThan(maxPriceHistoryLength);

      advanceOneTick();
      for (const symbol of symbols) {
        expect(getStockPriceHistory(symbol)).toHaveLength(loweredLength);
      }
    } finally {
      Settings.StockChartHistoryMinutes = originalMinutes;
    }
  });

  it("does not record while the wall-clock gate holds, and records once when it opens", () => {
    // Enough stored cycles, but no wall-clock time elapsed since init.
    processStockPrices(cyclesPerTick);
    for (const symbol of symbols) expect(getStockPriceHistory(symbol)).toHaveLength(1);

    jest.setSystemTime(Date.now() + StockMarketConstants.msPerStockUpdateMin - 1);
    processStockPrices(0);
    for (const symbol of symbols) expect(getStockPriceHistory(symbol)).toHaveLength(1);

    jest.setSystemTime(Date.now() + 1);
    processStockPrices(0);
    for (const symbol of symbols) expect(getStockPriceHistory(symbol)).toHaveLength(2);
  });

  it("records nothing while disabled, and resumes when re-enabled", () => {
    advanceTicks(2);
    for (const symbol of symbols) expect(getStockPriceHistory(symbol)).toHaveLength(3);

    Settings.DisableStockPriceHistory = true;
    try {
      advanceTicks(3); // the market still moves; nothing may be recorded
      for (const symbol of symbols) expect(getStockPriceHistory(symbol)).toHaveLength(3);
    } finally {
      Settings.DisableStockPriceHistory = false;
    }

    advanceOneTick();
    for (const symbol of symbols) {
      const history = getStockPriceHistory(symbol);
      expect(history).toHaveLength(4);
      expect(history[history.length - 1]).toBe(SymbolToStockMap[symbol].price);
    }
  });

  describe("reset paths", () => {
    it("initStockMarket discards history and re-anchors on current prices", () => {
      advanceTicks(20);
      initStockMarket();
      initSymbolToStockMap();
      for (const symbol of symbols) {
        expect(getStockPriceHistory(symbol)).toEqual([SymbolToStockMap[symbol].price]);
      }
    });

    it("deleteStockMarket clears all history", () => {
      advanceTicks(20);
      deleteStockMarket();
      for (const symbol of symbols) {
        expect(getStockPriceHistory(symbol)).toHaveLength(0);
      }
    });

    it("loading a save discards history and re-anchors on the loaded prices", () => {
      advanceTicks(20);
      const save = JSON.stringify(StockMarket);
      advanceTicks(5); // diverge so the assertion below can only pass via a real reset
      loadStockMarket(save);
      initSymbolToStockMap();
      const stocks = marketStocks();
      expect(stocks).toHaveLength(symbols.length); // guards against loadStockMarket's failure path
      for (const stock of stocks) {
        expect(getStockPriceHistory(stock.symbol)).toEqual([stock.price]);
      }
    });

    it("does not accumulate points across repeated reset cycles", () => {
      for (let cycle = 0; cycle < 25; ++cycle) {
        advanceTicks(5);
        const save = JSON.stringify(StockMarket);
        loadStockMarket(save);
        initSymbolToStockMap();
        expect(totalRetainedPoints()).toBe(symbols.length);

        advanceTicks(5);
        initStockMarket();
        initSymbolToStockMap();
        expect(totalRetainedPoints()).toBe(symbols.length);

        advanceTicks(5);
        deleteStockMarket();
        expect(totalRetainedPoints()).toBe(0);

        initStockMarket();
        initSymbolToStockMap();
      }
    });
  });

  describe("replace-not-mutate contract", () => {
    // The Sparkline memo compares `data` by reference; a mutated array would silently freeze the chart.
    function expectHistoriesReplacedNotMutated(): void {
      const before = symbols.map((symbol) => {
        const ref = getStockPriceHistory(symbol);
        return { symbol, ref, copy: [...ref] };
      });
      advanceOneTick();
      for (const { symbol, ref, copy } of before) {
        expect(getStockPriceHistory(symbol)).not.toBe(ref);
        expect(ref).toEqual(copy);
      }
    }

    it("while the buffer is filling", () => {
      advanceTicks(3);
      expectHistoriesReplacedNotMutated();
    });

    it("once the buffer is full (trim path)", () => {
      advanceTicks(maxPriceHistoryLength + 2);
      expect(getStockPriceHistory(symbols[0])).toHaveLength(maxPriceHistoryLength);
      expectHistoriesReplacedNotMutated();
    });
  });

  it("never reaches the save file", () => {
    advanceTicks(maxPriceHistoryLength + 5); // full buffers: the worst case for a leak
    // The exact payload SaveObject.ts puts in StockMarketSave. History lives outside StockMarket,
    // but a refactor hanging it off Stock would be serialized silently by Generic_toJSON - so
    // instead of looking for a known key, reject any numeric series anywhere in the save.
    const save: unknown = JSON.parse(JSON.stringify(StockMarket));
    const offenders: string[] = [];
    (function walk(node: unknown, path: string): void {
      if (Array.isArray(node)) {
        if (node.length >= 2 && node.every((entry) => typeof entry === "number")) offenders.push(path);
        node.forEach((entry, index) => walk(entry, `${path}[${index}]`));
      } else if (typeof node === "object" && node !== null) {
        for (const [key, value] of Object.entries(node)) walk(value, `${path}.${key}`);
      }
    })(save, "StockMarketSave");
    expect(offenders).toEqual([]);
  });
});
