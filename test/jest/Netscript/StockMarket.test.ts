import { Player } from "@player";
import { getMockedNetscriptContext, getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import {
  deleteStockMarket,
  getDefaultEmptyStockMarket,
  StockMarket,
  SymbolToStockMap,
} from "../../../src/StockMarket/StockMarket";
import { Stock } from "../../../src/StockMarket/Stock";
import { buyStock } from "../../../src/StockMarket/BuyingAndSelling";
import { getStockReward } from "../../../src/DarkNet/effects/cacheFiles";

function expectUninitializedStockMarket(): void {
  expect(StockMarket).toStrictEqual(getDefaultEmptyStockMarket());
  expect(Object.keys(SymbolToStockMap).length).toBe(0);
}

function expectInitializedStockMarket(): void {
  const symbols = Object.keys(StockMarket.Orders);
  expect(symbols.length).toBeGreaterThan(0);
  expect(symbols.includes("ECP")).toStrictEqual(true);
  expect(StockMarket["ECorp"] instanceof Stock).toStrictEqual(true);
  expect(StockMarket.lastUpdate).toBeGreaterThan(0);
  expect(Object.keys(SymbolToStockMap).length).toBeGreaterThan(0);
}

function buyShareOfECP(): void {
  const eCorpStock = StockMarket["ECorp"];
  expect(eCorpStock.playerShares).toStrictEqual(0);
  expect(buyStock(eCorpStock, 1, getMockedNetscriptContext(), {})).toStrictEqual(true);
  expect(eCorpStock.playerShares).toStrictEqual(1);
}

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
  Player.money = 1e100;

  deleteStockMarket();
  expectUninitializedStockMarket();
});

describe("WSE account and TIX API access", () => {
  test("purchaseWseAccount then purchaseTixApi", () => {
    const ns = getNS();

    // Check if purchaseWseAccount works
    expect(Player.hasWseAccount).toStrictEqual(false);
    expect(ns.stock.purchaseWseAccount()).toStrictEqual(true);
    expect(Player.hasWseAccount).toStrictEqual(true);
    expectInitializedStockMarket();

    buyShareOfECP();

    // Check if purchaseTixApi works
    expect(Player.hasTixApiAccess).toStrictEqual(false);
    expect(ns.stock.purchaseTixApi()).toStrictEqual(true);
    expect(Player.hasTixApiAccess).toStrictEqual(true);

    // Check if stock market data is reset
    expect(StockMarket["ECorp"].playerShares).toStrictEqual(1);
  });

  test("purchaseTixApi then purchaseWseAccount", () => {
    const ns = getNS();

    // Check if purchaseTixApi works
    expect(Player.hasTixApiAccess).toStrictEqual(false);
    expect(ns.stock.purchaseTixApi()).toStrictEqual(true);
    expect(Player.hasTixApiAccess).toStrictEqual(true);
    expectInitializedStockMarket();

    buyShareOfECP();

    // Check if purchaseWseAccount works
    expect(Player.hasWseAccount).toStrictEqual(false);
    expect(ns.stock.purchaseWseAccount()).toStrictEqual(true);
    expect(Player.hasWseAccount).toStrictEqual(true);

    // Check if stock market data is reset
    expect(StockMarket["ECorp"].playerShares).toStrictEqual(1);
  });
});

describe("4S Market Data", () => {
  test("purchase4SMarketData", () => {
    const ns = getNS();
    expect(ns.stock.purchase4SMarketData()).toStrictEqual(false);
    ns.stock.purchaseWseAccount();
    expect(ns.stock.purchase4SMarketData()).toStrictEqual(true);
    expect(Player.has4SData).toStrictEqual(true);
  });
  test("purchase4SMarketDataTixApi", () => {
    const ns = getNS();
    expect(() => ns.stock.purchase4SMarketDataTixApi()).toThrow("You don't have TIX API Access");
    ns.stock.purchaseTixApi();
    expect(ns.stock.purchase4SMarketDataTixApi()).toStrictEqual(true);
    expect(Player.has4SDataTixApi).toStrictEqual(true);
  });
});

describe("Prestige", () => {
  test("soft reset without initializing stock market", () => {
    const ns = getNS();
    ns.singularity.softReset();
    expectUninitializedStockMarket();
  });
  test("soft reset after initializing stock market", () => {
    const ns = getNS();
    ns.stock.purchaseTixApi();
    expectInitializedStockMarket();
    buyShareOfECP();
    expect(StockMarket["ECorp"].playerShares).toStrictEqual(1);

    ns.singularity.softReset();
    expect(StockMarket["ECorp"].playerShares).toStrictEqual(0);
  });
  test("soft reset after getting shares from dnet caches", () => {
    const ns = getNS();
    expectUninitializedStockMarket();
    const reward = getStockReward(0);
    if (!reward.stockSymbol) {
      throw new Error(`Invalid cache reward: ${JSON.stringify(reward)}`);
    }
    expectInitializedStockMarket();
    expect(SymbolToStockMap[reward.stockSymbol].playerShares).toBeGreaterThan(0);
    ns.singularity.softReset();
    expectUninitializedStockMarket();
  });
  test("b1tflum3", () => {
    const ns = getNS();
    ns.stock.purchaseTixApi();
    expectInitializedStockMarket();
    buyShareOfECP();

    ns.singularity.b1tflum3(1);
    expectUninitializedStockMarket();
  });
  test("b1tflum3 with SF8", () => {
    const ns = getNS();
    ns.stock.purchaseTixApi();
    expectInitializedStockMarket();
    buyShareOfECP();

    Player.sourceFiles.set(8, 1);
    ns.singularity.b1tflum3(1);
    expectInitializedStockMarket();
    expect(StockMarket["ECorp"].playerShares).toStrictEqual(0);
  });
  test("b1tflum3 after getting shares from dnet caches", () => {
    const ns = getNS();
    expectUninitializedStockMarket();
    const reward = getStockReward(0);
    if (!reward.stockSymbol) {
      throw new Error(`Invalid cache reward: ${JSON.stringify(reward)}`);
    }
    expectInitializedStockMarket();
    expect(SymbolToStockMap[reward.stockSymbol].playerShares).toBeGreaterThan(0);
    ns.singularity.b1tflum3(1);
    expectUninitializedStockMarket();
  });
});
