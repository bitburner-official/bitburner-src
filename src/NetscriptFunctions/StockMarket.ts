import { Player } from "@player";
import { buyStock, sellStock, shortStock, sellShort } from "../StockMarket/BuyingAndSelling";
import {
  StockMarket,
  SymbolToStockMap,
  placeOrder,
  cancelOrder,
  initStockMarket,
  StockMarketPromise,
  isStockMarketInitialized,
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
import type { StockOrder, Stock as StockAPI } from "@nsdefs";
import { setRemovedFunctions, type InternalAPI, type NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { StockMarketConstants } from "../StockMarket/data/Constants";
import { getEnumHelper } from "../utils/EnumHelper";
import { CONSTANTS } from "../Constants";
import { getDarknetVolatilityMult } from "../DarkNet/effects/effects";
import { knowAboutBitverse } from "../BitNode/BitNodeUtils";

export const getStockFromSymbol = function (ctx: NetscriptContext, symbol: string): Stock {
  const stock = SymbolToStockMap[symbol];
  if (stock == null) {
    throw helpers.errorMessage(ctx, `无效的股票代码：'${symbol}'`);
  }

  return stock;
};

export function NetscriptStockMarket(): InternalAPI<StockAPI> {
  /** Checks if the player has TIX API access. Throws an error if the player does not */
  const checkTixApiAccess = function (ctx: NetscriptContext): void {
    if (!Player.hasTixApiAccess) {
      throw helpers.errorMessage(ctx, `你没有 TIX API 权限！无法使用 ${ctx.function}()`);
    }
  };
  const checkSFAccess = function (ctx: NetscriptContext, sfLevel: number): void {
    if (Player.bitNodeN !== 8 && Player.activeSourceFileLvl(8) < sfLevel) {
      const errorMessage = knowAboutBitverse()
        ? `你必须处于 BitNode-8 或拥有源文件 8.${sfLevel}。`
        : "你目前还无法访问此 API。它会在之后解锁，届时如何获取它会非常明显。";
      throw helpers.errorMessage(ctx, errorMessage);
    }
  };

  const stockFunctions: InternalAPI<StockAPI> = {
    getConstants: () => structuredClone(StockMarketConstants),
    hasWseAccount: () => Player.hasWseAccount,
    hasTixApiAccess: () => Player.hasTixApiAccess,
    has4SData: () => Player.has4SData,
    has4SDataTixApi: () => Player.has4SDataTixApi,
    getSymbols: (ctx) => {
      checkTixApiAccess(ctx);
      return Object.values(StockSymbol);
    },
    getPrice: (ctx, _symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.price;
    },
    getOrganization: (ctx, _symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.name;
    },
    getAskPrice: (ctx, _symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.getAskPrice();
    },
    getBidPrice: (ctx, _symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.getBidPrice();
    },
    getPosition: (ctx, _symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = SymbolToStockMap[symbol];
      if (stock == null) {
        throw helpers.errorMessage(ctx, `无效的股票代码：${symbol}`);
      }
      return [stock.playerShares, stock.playerAvgPx, stock.playerShortShares, stock.playerAvgShortPx];
    },
    getMaxShares: (ctx, _symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);

      return stock.maxShares;
    },
    getPurchaseCost: (ctx, _symbol, _shares, _posType) => {
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
    getSaleGain: (ctx, _symbol, _shares, _posType) => {
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
    buyStock: (ctx, _symbol, _shares) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);
      const res = buyStock(stock, shares, ctx, {});
      return res ? stock.getAskPrice() : 0;
    },
    sellStock: (ctx, _symbol, _shares) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      checkTixApiAccess(ctx);
      const stock = getStockFromSymbol(ctx, symbol);
      const res = sellStock(stock, shares, ctx, {});

      return res ? stock.getBidPrice() : 0;
    },
    buyShort: (ctx, _symbol, _shares) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      checkTixApiAccess(ctx);
      checkSFAccess(ctx, 2);
      const stock = getStockFromSymbol(ctx, symbol);
      const res = shortStock(stock, shares, ctx, {});

      return res ? stock.getBidPrice() : 0;
    },
    sellShort: (ctx, _symbol, _shares) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      checkTixApiAccess(ctx);
      checkSFAccess(ctx, 2);
      const stock = getStockFromSymbol(ctx, symbol);
      const res = sellShort(stock, shares, ctx, {});

      return res ? stock.getAskPrice() : 0;
    },
    placeOrder: (ctx, _symbol, _shares, _price, _type, _pos) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      const price = helpers.number(ctx, "price", _price);
      const type = getEnumHelper("OrderType").nsGetMember(ctx, _type);
      const pos = getEnumHelper("PositionType").nsGetMember(ctx, _pos);
      checkTixApiAccess(ctx);
      checkSFAccess(ctx, 3);
      const stock = getStockFromSymbol(ctx, symbol);

      return placeOrder(stock, shares, price, type, pos, ctx);
    },
    cancelOrder: (ctx, _symbol, _shares, _price, _type, _pos) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const shares = helpers.number(ctx, "shares", _shares);
      const price = helpers.number(ctx, "price", _price);
      const type = getEnumHelper("OrderType").nsGetMember(ctx, _type);
      const pos = getEnumHelper("PositionType").nsGetMember(ctx, _pos);
      checkTixApiAccess(ctx);
      checkSFAccess(ctx, 3);
      const stock = getStockFromSymbol(ctx, symbol);
      if (isNaN(shares) || isNaN(price)) {
        throw helpers.errorMessage(ctx, `无效的股数或价格。必须是数字。shares=${shares}，price=${price}`);
      }

      return cancelOrder({ stock, shares, price, type, pos }, ctx);
    },
    getOrders: (ctx) => {
      checkTixApiAccess(ctx);
      checkSFAccess(ctx, 3);

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
    getVolatility: (ctx, _symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      if (!Player.has4SDataTixApi) {
        throw helpers.errorMessage(ctx, "你没有 4S 市场数据 TIX API 权限！");
      }
      const stock = getStockFromSymbol(ctx, symbol);
      const volatility = stock.mv * getDarknetVolatilityMult(symbol);

      return volatility / 100; // Convert from percentage to decimal
    },
    getForecast: (ctx, _symbol) => {
      const symbol = helpers.string(ctx, "symbol", _symbol);
      if (!Player.has4SDataTixApi) {
        throw helpers.errorMessage(ctx, "你没有 4S 市场数据 TIX API 权限！");
      }
      const stock = getStockFromSymbol(ctx, symbol);

      let forecast = 50;
      stock.b ? (forecast += stock.otlkMag) : (forecast -= stock.otlkMag);
      return forecast / 100; // Convert from percentage to decimal
    },
    purchase4SMarketData: (ctx) => {
      if (Player.bitNodeOptions.disable4SData) {
        helpers.log(ctx, () => "4S 市场数据已在 BitNode 高级选项中被禁用。");
        return false;
      }

      if (Player.has4SData) {
        helpers.log(ctx, () => "已购买过 4S 市场数据。");
        return true;
      }

      if (!Player.hasWseAccount) {
        helpers.log(ctx, () => "你需要拥有 WSE 账户。");
        return false;
      }

      if (Player.money < getStockMarket4SDataCost()) {
        helpers.log(ctx, () => "资金不足，无法购买 4S 市场数据。");
        return false;
      }

      Player.has4SData = true;
      Player.loseMoney(getStockMarket4SDataCost(), "stock");
      helpers.log(ctx, () => "已购买 4S 市场数据");
      return true;
    },
    purchase4SMarketDataTixApi: (ctx) => {
      if (Player.bitNodeOptions.disable4SData) {
        helpers.log(ctx, () => "4S 市场数据已在 BitNode 高级选项中被禁用。");
        return false;
      }

      checkTixApiAccess(ctx);

      if (Player.has4SDataTixApi) {
        helpers.log(ctx, () => "已购买过 4S 市场数据 TIX API");
        return true;
      }

      if (Player.money < getStockMarket4STixApiCost()) {
        helpers.log(ctx, () => "资金不足，无法购买 4S 市场数据 TIX API");
        return false;
      }

      Player.has4SDataTixApi = true;
      Player.loseMoney(getStockMarket4STixApiCost(), "stock");
      helpers.log(ctx, () => "已购买 4S 市场数据 TIX API");
      return true;
    },
    purchaseWseAccount: (ctx) => {
      if (Player.hasWseAccount) {
        helpers.log(ctx, () => "已购买过 WSE 账户");
        return true;
      }

      if (Player.money < getStockMarketWseCost()) {
        helpers.log(ctx, () => "资金不足，无法购买 WSE 账户");
        return false;
      }

      Player.hasWseAccount = true;
      if (!isStockMarketInitialized()) {
        initStockMarket();
      }
      Player.loseMoney(getStockMarketWseCost(), "stock");
      helpers.log(ctx, () => "已购买 WSE 账户");
      return true;
    },
    purchaseTixApi: (ctx) => {
      if (Player.hasTixApiAccess) {
        helpers.log(ctx, () => "已购买过 TIX API");
        return true;
      }

      if (Player.money < getStockMarketTixApiCost()) {
        helpers.log(ctx, () => "资金不足，无法购买 TIX API 权限");
        return false;
      }

      Player.hasTixApiAccess = true;
      if (!isStockMarketInitialized()) {
        initStockMarket();
      }
      Player.loseMoney(getStockMarketTixApiCost(), "stock");
      helpers.log(ctx, () => "已购买 TIX API");
      return true;
    },
    getBonusTime: (ctx) => {
      checkTixApiAccess(ctx);
      return StockMarket.storedCycles * CONSTANTS.MilliPerCycle;
    },
    nextUpdate: (ctx) => {
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
