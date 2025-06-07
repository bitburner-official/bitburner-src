import { Player } from "@player";
import { buyStock, sellStock, shortStock, sellShort } from "../StockMarket/BuyingAndSelling";
import {
  StockMarket,
  SymbolToStockMap,
  placeOrder,
  cancelOrder,
  initStockMarket,
  StockMarketPromise,
} from "../StockMarket/StockMarket";
import { getBuyTransactionCost, getSellTransactionGain } from "../StockMarket/StockMarketHelpers";
import { StockSymbol } from "@enums";
import {
  getStockMarket4SDataCost,
  getStockMarket4STixApiCost,
  getStockMarketWseCost,
  getStockMarketTixApiCost,
} from "../StockMarket/StockMarketCosts";
import type { Stock } from "../StockMarket/Stock";
import type { StockOrder, TIX } from "@nsdefs";
import { setRemovedFunctions, type InternalAPI, type NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { StockMarketConstants } from "../StockMarket/data/Constants";
import { getEnumHelper } from "../utils/EnumHelper";

export function NetscriptStockMarket(): InternalAPI<TIX> {
  /** Checks if the player has TIX API access. Throws an error if the player does not */
  const checkTixApiAccess = function (ctx: NetscriptContext): void {
    if (!Player.hasWseAccount) {
      throw helpers.errorMessage(ctx, `You don't have WSE Access! Cannot use ${ctx.function}()`);
    }
    if (!Player.hasTixApiAccess) {
      throw helpers.errorMessage(ctx, `You don't have TIX API Access! Cannot use ${ctx.function}()`);
    }
  };

  const getStockFromSymbol = function (ctx: NetscriptContext, symbol: string): Stock {
    const stock = SymbolToStockMap[symbol];
    if (stock == null) {
      throw helpers.errorMessage(ctx, `Invalid stock symbol: '${symbol}'`);
    }

    return stock;
  };

  const stockFunctions: InternalAPI<TIX> = {
    getConstants: () => () => structuredClone(StockMarketConstants),
    hasWseAccount: () => () => Player.hasWseAccount,
    hasTixApiAccess: () => () => Player.hasTixApiAccess,
    has4SData: () => () => Player.has4SData,
    has4SDataTixApi: () => () => Player.has4SDataTixApi,
    getSymbols: (ctx) => () => {
      checkTixApiAccess(ctx);
      return Object.values(StockSymbol);
    },
    getPrice: (ctx) => (_symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.price;
    },
    getOrganization: (ctx) => (_symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.name;
    },
    getAskPrice: (ctx) => (_symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.getAskPrice();
    },
    getBidPrice: (ctx) => (_symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.getBidPrice();
    },
    getPosition: (ctx) => (_symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = SymbolToStockMap[symbol];
      if (stock == null) {
        throw helpers.errorMessage(ctx, `Invalid stock symbol: ${symbol}`);
      }
      return [stock.playerShares, stock.playerAvgPx, stock.playerShortShares, stock.playerAvgShortPx];
    },
    getMaxShares: (ctx) => (_symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.maxShares;
    },
    getPurchaseCost: (ctx) => (_symbol, _shares, _posType) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      let shares = helpers.number(ctx, "shares", _shares);
      const posType = getEnumHelper("PositionType").nsGetMember(ctx, _posType);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);
      shares = Math.round(shares);

      const res = getBuyTransactionCost(stock, shares, posType);
      if (res == null) {
        return Infinity;
      }

      return res;
    },
    getSaleGain: (ctx) => (_symbol, _shares, _posType) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      let shares = helpers.number(ctx, "shares", _shares);
      const posType = getEnumHelper("PositionType").nsGetMember(ctx, _posType);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);
      shares = Math.round(shares);

      const res = getSellTransactionGain(stock, shares, posType);
      if (res == null) {
        return 0;
      }

      return res;
    },
    buyStock: (ctx) => (_symbol, _shares) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);
      const res = buyStock(stock, shares, ctx, {});
      return res ? stock.getAskPrice() : 0;
    },
    sellStock: (ctx) => (_symbol, _shares) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);
      const res = sellStock(stock, shares, ctx, {});

      return res ? stock.getBidPrice() : 0;
    },
    buyShort: (ctx) => (_symbol, _shares) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      checkTixApiAccess(ctx);
      if (Player.bitNodeN !== 8 && Player.activeSourceFileLvl(8) <= 1) {
        throw helpers.errorMessage(ctx, "You must either be in BitNode-8 or you must have Source-File 8 Level 2.");
      }
      const stock = getStockFromSymbol(ctx, symbol);
      const res = shortStock(stock, shares, ctx, {});

      return res ? stock.getBidPrice() : 0;
    },
    sellShort: (ctx) => (_symbol, _shares) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      checkTixApiAccess(ctx);
      if (Player.bitNodeN !== 8 && Player.activeSourceFileLvl(8) <= 1) {
        throw helpers.errorMessage(ctx, "You must either be in BitNode-8 or you must have Source-File 8 Level 2.");
      }
      const stock = getStockFromSymbol(ctx, symbol);
      const res = sellShort(stock, shares, ctx, {});

      return res ? stock.getAskPrice() : 0;
    },
    placeOrder: (ctx) => (_symbol, _shares, _price, _type, _pos) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      const price = helpers.number(ctx, "price", _price);
      const type = getEnumHelper("OrderType").nsGetMember(ctx, _type);
      const pos = getEnumHelper("PositionType").nsGetMember(ctx, _pos);
      checkTixApiAccess(ctx);
      if (Player.bitNodeN !== 8 && Player.activeSourceFileLvl(8) <= 2) {
        throw helpers.errorMessage(ctx, "You must either be in BitNode-8 or you must have Source-File 8 Level 3.");
      }
      const stock = getStockFromSymbol(ctx, symbol);

      return placeOrder(stock, shares, price, type, pos, ctx);
    },
    cancelOrder: (ctx) => (_symbol, _shares, _price, _type, _pos) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      const price = helpers.number(ctx, "price", _price);
      const type = getEnumHelper("OrderType").nsGetMember(ctx, _type);
      const pos = getEnumHelper("PositionType").nsGetMember(ctx, _pos);
      checkTixApiAccess(ctx);
      if (Player.bitNodeN !== 8 && Player.activeSourceFileLvl(8) <= 2) {
        throw helpers.errorMessage(ctx, "You must either be in BitNode-8 or you must have Source-File 8 Level 3.");
      }
      const stock = getStockFromSymbol(ctx, symbol);
      if (isNaN(shares) || isNaN(price)) {
        throw helpers.errorMessage(ctx, `Invalid shares or price. Must be numeric. shares=${shares}, price=${price}`);
      }

      return cancelOrder({ stock, shares, price, type, pos }, ctx);
    },
    getOrders: (ctx) => () => {
      checkTixApiAccess(ctx);
      if (Player.bitNodeN !== 8 && Player.activeSourceFileLvl(8) <= 2) {
        throw helpers.errorMessage(ctx, "You must either be in BitNode-8 or have Source-File 8 Level 3.");
      }

      const orders: Record<string, StockOrder[]> = {};

      const stockMarketOrders = StockMarket.Orders;
      for (const symbol of Object.keys(stockMarketOrders)) {
        const orderBook = stockMarketOrders[symbol];
        if (orderBook.constructor === Array && orderBook.length > 0) {
          orders[symbol] = [];
          for (let i = 0; i < orderBook.length; ++i) {
            orders[symbol].push({
              shares: orderBook[i].shares,
              price: orderBook[i].price,
              type: orderBook[i].type,
              position: orderBook[i].pos,
            });
          }
        }
      }

      return orders;
    },
    getVolatility: (ctx) => (_symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      if (!Player.has4SDataTixApi) {
        throw helpers.errorMessage(ctx, "You don't have 4S Market Data TIX API Access!");
      }
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.mv / 100; // Convert from percentage to decimal
    },
    getForecast: (ctx) => (_symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      if (!Player.has4SDataTixApi) {
        throw helpers.errorMessage(ctx, "You don't have 4S Market Data TIX API Access!");
      }
      const stock = getStockFromSymbol(ctx, symbol);

      let forecast = 50;
      stock.b ? (forecast += stock.otlkMag) : (forecast -= stock.otlkMag);
      return forecast / 100; // Convert from percentage to decimal
    },
    purchase4SMarketData: (ctx) => () => {
      if (Player.bitNodeOptions.disable4SData) {
        helpers.log(ctx, () => "4S Market Data is disabled.");
        return false;
      }

      if (Player.has4SData) {
        helpers.log(ctx, () => "Already purchased 4S Market Data.");
        return true;
      }

      if (Player.money < getStockMarket4SDataCost()) {
        helpers.log(ctx, () => "Not enough money to purchase 4S Market Data.");
        return false;
      }

      Player.has4SData = true;
      Player.loseMoney(getStockMarket4SDataCost(), "stock");
      helpers.log(ctx, () => "Purchased 4S Market Data");
      return true;
    },
    purchase4SMarketDataTixApi: (ctx) => () => {
      if (Player.bitNodeOptions.disable4SData) {
        helpers.log(ctx, () => "4S Market Data is disabled.");
        return false;
      }

      checkTixApiAccess(ctx);

      if (Player.has4SDataTixApi) {
        helpers.log(ctx, () => "Already purchased 4S Market Data TIX API");
        return true;
      }

      if (Player.money < getStockMarket4STixApiCost()) {
        helpers.log(ctx, () => "Not enough money to purchase 4S Market Data TIX API");
        return false;
      }

      Player.has4SDataTixApi = true;
      Player.loseMoney(getStockMarket4STixApiCost(), "stock");
      helpers.log(ctx, () => "Purchased 4S Market Data TIX API");
      return true;
    },
    purchaseWseAccount: (ctx) => () => {
      if (Player.hasWseAccount) {
        helpers.log(ctx, () => "Already purchased WSE Account");
        return true;
      }

      if (Player.money < getStockMarketWseCost()) {
        helpers.log(ctx, () => "Not enough money to purchase WSE Account Access");
        return false;
      }

      Player.hasWseAccount = true;
      initStockMarket();
      Player.loseMoney(getStockMarketWseCost(), "stock");
      helpers.log(ctx, () => "Purchased WSE Account Access");
      return true;
    },
    purchaseTixApi: (ctx) => () => {
      if (Player.hasTixApiAccess) {
        helpers.log(ctx, () => "Already purchased TIX API");
        return true;
      }

      if (Player.money < getStockMarketTixApiCost()) {
        helpers.log(ctx, () => "Not enough money to purchase TIX API Access");
        return false;
      }

      Player.hasTixApiAccess = true;
      Player.loseMoney(getStockMarketTixApiCost(), "stock");
      helpers.log(ctx, () => "Purchased TIX API");
      return true;
    },
    getBonusTime: (ctx) => () => {
      checkTixApiAccess(ctx);
      return StockMarket.storedCycles * 200;
    },
    nextUpdate: (ctx) => () => {
      checkTixApiAccess(ctx);
      if (!StockMarketPromise.promise)
        StockMarketPromise.promise = new Promise<number>((res) => (StockMarketPromise.resolve = res));
      return StockMarketPromise.promise;
    },
  };

  setRemovedFunctions(stockFunctions, {
    hasWSEAccount: { version: "3.0.0", replacement: "stock.hasWseAccount()" },
    hasTIXAPIAccess: { version: "3.0.0", replacement: "stock.hasTixApiAccess()" },
    has4SDataTIXAPI: { version: "3.0.0", replacement: "stock.has4SDataTixApi()" },
  });

  return stockFunctions;
}
