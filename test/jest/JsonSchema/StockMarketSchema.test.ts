import { JsonSchemaValidator } from "../../../src/JsonSchema/JsonSchemaValidator";
import {
  deleteStockMarket,
  getDefaultEmptyStockMarket,
  initStockMarket,
  StockMarket,
} from "../../../src/StockMarket/StockMarket";

deleteStockMarket();
initStockMarket();
// Get the clone of StockMarket immediately after calling deleteStockMarket() and initStockMarket().
const defaultStockMarket = structuredClone(StockMarket);

/**
 * We must call this function to get the data for testing. Do not use the module-scoped "StockMarket" from
 * src/StockMarket/StockMarket. Jest tests run in parallel, so our tests may mutate that variable and result in wrong
 * tests.
 */
function getCloneOfDefaultStockMarket(): Record<string, unknown> {
  return structuredClone(defaultStockMarket);
}

function getCloneOfSampleStock() {
  return {
    name: "ECorp",
    symbol: "ECP",
    price: 24618.907733048673,
    lastPrice: 24702.20549043557,
    playerShares: 2,
    playerAvgPx: 19893.251484918932,
    playerShortShares: 0,
    playerAvgShortPx: 0,
    mv: 0.44,
    b: true,
    otlkMag: 17.783525574804138,
    otlkMagForecast: 68.11871382128285,
    cap: 148683699,
    spreadPerc: 0.5,
    shareTxForMovement: 76967,
    shareTxUntilMovement: 76967,
    totalShares: 140600000,
    maxShares: 28100000,
  };
}

function getCloneOfSampleOrders() {
  return {
    ECP: [
      {
        stockSymbol: "ECP",
        shares: 1,
        price: 1000,
        type: "Limit Buy Order",
        pos: "L",
      },
    ],
  };
}

type SampleOrders = ReturnType<typeof getCloneOfSampleOrders>;

describe("Success", () => {
  test("Default empty StockMarket", () => {
    expect(JsonSchemaValidator.StockMarket(getDefaultEmptyStockMarket())).toStrictEqual(true);
  });
  test("Default StockMarket", () => {
    expect(JsonSchemaValidator.StockMarket(getCloneOfDefaultStockMarket())).toStrictEqual(true);
  });
  test("StockMarket with Orders", () => {
    const stockMarket = getCloneOfDefaultStockMarket();
    stockMarket.Orders = getCloneOfSampleOrders();
    expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(true);
  });
});

describe("Failure", () => {
  test("Have unexpected property", () => {
    const stockMarket = getCloneOfDefaultStockMarket();
    stockMarket.test = "";
    expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
  });

  test("Do not have lastUpdate property", () => {
    const stockMarket = getCloneOfDefaultStockMarket();
    delete stockMarket.lastUpdate;
    expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
  });

  describe("Invalid stock", () => {
    test("Have invalid type of stock", () => {
      const stockMarket = getCloneOfDefaultStockMarket();
      stockMarket.ECorp = [];
      expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
    });
    const sampleStock = getCloneOfSampleStock();
    for (const [key, value] of Object.entries(sampleStock)) {
      if (typeof value === "string") {
        continue;
      }
      test(`Have invalid ${key}`, () => {
        const stockMarket = getCloneOfDefaultStockMarket();
        stockMarket.ECorp = getCloneOfSampleStock();
        (stockMarket.ECorp as { [_: string]: unknown })[key] = "test";
        expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
      });
    }
  });

  describe("Invalid Orders", () => {
    test("Have invalid type of Orders", () => {
      const stockMarket = getCloneOfDefaultStockMarket();
      stockMarket.Orders = [];
      expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
    });
    test("Have invalid Order: Invalid order type", () => {
      const stockMarket = getCloneOfDefaultStockMarket();
      stockMarket.Orders = getCloneOfSampleOrders();
      (stockMarket.Orders as SampleOrders).ECP[0].type = "Limit Buy Order1";
      expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
    });
    test("Have invalid Order: Invalid position type", () => {
      const stockMarket = getCloneOfDefaultStockMarket();
      stockMarket.Orders = getCloneOfSampleOrders();
      (stockMarket.Orders as SampleOrders).ECP[0].pos = "L1";
      expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
    });
    test("Have invalid Order: Invalid shares", () => {
      const stockMarket = getCloneOfDefaultStockMarket();
      stockMarket.Orders = getCloneOfSampleOrders();
      ((stockMarket.Orders as SampleOrders).ECP[0].shares as unknown) = "1";
      expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
    });
    test("Have invalid Order: Invalid price", () => {
      const stockMarket = getCloneOfDefaultStockMarket();
      stockMarket.Orders = getCloneOfSampleOrders();
      ((stockMarket.Orders as SampleOrders).ECP[0].price as unknown) = "1000";
      expect(JsonSchemaValidator.StockMarket(stockMarket)).toStrictEqual(false);
    });
  });
});
