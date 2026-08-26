/**
 * Functions for buying/selling stocks. There are four functions total, two for
 * long positions and two for short positions.
 */
import { Stock } from "./Stock";
import {
  getBuyTransactionCost,
  getSellTransactionGain,
  processTransactionForecastMovement,
} from "./StockMarketHelpers";

import { PositionType } from "@enums";

import { StockMarketConstants } from "./data/Constants";
import { Player } from "@player";

import { formatMoney, formatShares } from "../ui/formatNumber";
import { Money } from "../ui/React/Money";

import { dialogBoxCreate } from "../ui/React/DialogBox";

import * as React from "react";
import { NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";

/** Each function takes an optional config object as its last argument */
interface IOptions {
  rerenderFn?: () => void;
  suppressDialog?: boolean;
}

/**
 * Attempt to buy a stock in the long position
 * @param {Stock} stock - Stock to buy
 * @param {number} shares - Number of shares to buy
 * @param {NetscriptContext} ctx - If this is being called through Netscript
 * @param opts - Optional configuration for this function's behavior. See top of file
 * @returns {boolean} - true if successful, false otherwise
 */
export function buyStock(
  stock: Stock,
  shares: number,
  ctx: NetscriptContext | null = null,
  opts: IOptions = {},
): boolean {
  // Validate arguments
  shares = Math.round(shares);
  if (shares <= 0) {
    return false;
  }
  if (stock == null || isNaN(shares)) {
    if (ctx) {
      helpers.log(ctx, () => `参数无效：股票='${stock?.name}' 数量='${shares}'`);
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate("购买股票失败。这可能是个 bug，请联系开发者");
    }

    return false;
  }

  // Does player have enough money?
  const totalPrice = getBuyTransactionCost(stock, shares, PositionType.Long);
  if (totalPrice == null) {
    return false;
  }
  if (Player.money < totalPrice) {
    if (ctx) {
      helpers.log(ctx, () => `你的资金不足以购买该持仓。需要 ${formatMoney(totalPrice)}。`);
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        <>
          你的资金不足以完成此次购买。你需要 <Money money={totalPrice} />
        </>,
      );
    }

    return false;
  }

  // Would this purchase exceed the maximum number of shares?
  if (shares + stock.playerShares + stock.playerShortShares > stock.maxShares) {
    if (ctx) {
      helpers.log(
        ctx,
        () =>
          `购买 '${shares + stock.playerShares + stock.playerShortShares}' 股将超过 ${
            stock.symbol
          } 的最大股数（${stock.maxShares}）`,
      );
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        `你无法购买这么多股票。${stock.symbol} 的最大股数为 ${formatShares(
          stock.maxShares,
        )} 股。`,
      );
    }

    return false;
  }

  const origTotal = stock.playerShares * stock.playerAvgPx;
  Player.loseMoney(totalPrice, "stock");
  const newTotal = origTotal + totalPrice - StockMarketConstants.StockMarketCommission;
  stock.playerShares = Math.round(stock.playerShares + shares);
  stock.playerAvgPx = newTotal / stock.playerShares;
  processTransactionForecastMovement(stock, shares);
  if (opts.rerenderFn != null && typeof opts.rerenderFn === "function") {
    opts.rerenderFn();
  }

  if (ctx) {
    const resultTxt = `以 ${formatMoney(totalPrice)} 买入了 ${stock.symbol} 的 ${formatShares(
      shares,
    )} 股。支付了 ${formatMoney(StockMarketConstants.StockMarketCommission)} 佣金。`;
    helpers.log(ctx, () => resultTxt);
  } else if (opts.suppressDialog !== true) {
    dialogBoxCreate(
      <>
        以 <Money money={totalPrice} /> 买入了 {stock.symbol} 的 {formatShares(shares)} 股。支付了{" "}
        <Money money={StockMarketConstants.StockMarketCommission} /> 佣金。
      </>,
    );
  }

  return true;
}

/**
 * Attempt to sell a stock in the long position
 * @param {Stock} stock - Stock to sell
 * @param {number} shares - Number of shares to sell
 * @param {NetscriptContext} ctx - If this is being called through Netscript
 * @param opts - Optional configuration for this function's behavior. See top of file
 * returns {boolean} - true if successfully sells given number of shares OR MAX owned, false otherwise
 */
export function sellStock(
  stock: Stock,
  shares: number,
  ctx: NetscriptContext | null = null,
  opts: IOptions = {},
): boolean {
  // Sanitize/Validate arguments
  if (stock == null || shares < 0 || isNaN(shares)) {
    if (ctx) {
      helpers.log(ctx, () => `参数无效：股票='${stock?.name}' 数量='${shares}'`);
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        "卖出股票失败。这可能是数量无效所致；否则这可能是个 bug，请联系开发者",
      );
    }

    return false;
  }
  shares = Math.round(shares);
  if (shares > stock.playerShares) {
    shares = stock.playerShares;
  }
  if (shares === 0) {
    return false;
  }

  const gains = getSellTransactionGain(stock, shares, PositionType.Long);
  if (gains == null) {
    return false;
  }
  let netProfit = gains - stock.playerAvgPx * shares;
  if (isNaN(netProfit)) {
    netProfit = 0;
  }
  Player.gainMoney(gains, "stock");
  if (ctx) {
    ctx.workerScript.scriptRef.onlineMoneyMade += netProfit;
    Player.scriptProdSinceLastAug += netProfit;
  }

  stock.playerShares = Math.round(stock.playerShares - shares);
  if (stock.playerShares === 0) {
    stock.playerAvgPx = 0;
  }

  processTransactionForecastMovement(stock, shares);

  if (opts.rerenderFn != null && typeof opts.rerenderFn === "function") {
    opts.rerenderFn();
  }

  if (ctx) {
    const resultTxt =
      `卖出了 ${stock.symbol} 的 ${formatShares(shares)} 股。` +
      `扣除佣金后，你总共获得了 ${formatMoney(gains)}。`;
    helpers.log(ctx, () => resultTxt);
  } else if (opts.suppressDialog !== true) {
    dialogBoxCreate(
      <>
        卖出了 {stock.symbol} 的 {formatShares(shares)} 股。扣除佣金后，你总共获得了{" "}
        <Money money={gains} />。
      </>,
    );
  }

  return true;
}

/**
 * Attempt to buy a stock in the short position
 * @param {Stock} stock - Stock to sell
 * @param {number} shares - Number of shares to short
 * @param {NetscriptContext} ctx - If this is being called through Netscript
 * @param opts - Optional configuration for this function's behavior. See top of file
 * @returns {boolean} - true if successful, false otherwise
 */
export function shortStock(
  stock: Stock,
  shares: number,
  ctx: NetscriptContext | null = null,
  opts: IOptions = {},
): boolean {
  // Validate arguments
  shares = Math.round(shares);
  if (shares <= 0) {
    return false;
  }
  if (stock == null || isNaN(shares)) {
    if (ctx) {
      helpers.log(ctx, () => `参数无效：股票='${stock?.name}' 数量='${shares}'`);
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        "建立股票空头仓位失败。这可能是" +
          "数量无效所致；否则这可能是个 bug，请联系开发者",
      );
    }
    return false;
  }

  // Does the player have enough money?
  const totalPrice = getBuyTransactionCost(stock, shares, PositionType.Short);
  if (totalPrice == null) {
    return false;
  }
  if (Player.money < totalPrice) {
    if (ctx) {
      helpers.log(
        ctx,
        () => "你的资金不足，" + "无法购买该空头仓位。需要 " + formatMoney(totalPrice),
      );
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        <>
          你的资金不足以购买该空头仓位。你需要 <Money money={totalPrice} />
        </>,
      );
    }

    return false;
  }

  // Would this purchase exceed the maximum number of shares?
  if (shares + stock.playerShares + stock.playerShortShares > stock.maxShares) {
    if (ctx) {
      helpers.log(
        ctx,
        () =>
          `'${shares + stock.playerShares + stock.playerShortShares}' 股空头将超过 ${
            stock.symbol
          } 的最大股数（${stock.maxShares}）。`,
      );
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        `你无法购买这么多股票。${stock.symbol} 的最大股数为 ${stock.maxShares} 股。`,
      );
    }

    return false;
  }

  const origTotal = stock.playerShortShares * stock.playerAvgShortPx;
  Player.loseMoney(totalPrice, "stock");
  const newTotal = origTotal + totalPrice - StockMarketConstants.StockMarketCommission;
  stock.playerShortShares = Math.round(stock.playerShortShares + shares);
  stock.playerAvgShortPx = newTotal / stock.playerShortShares;
  processTransactionForecastMovement(stock, shares);

  if (opts.rerenderFn != null && typeof opts.rerenderFn === "function") {
    opts.rerenderFn();
  }

  if (ctx) {
    const resultTxt =
      `为 ${stock.symbol} 买入了 ${formatShares(shares)} 股空头仓位，` +
      `花费 ${formatMoney(totalPrice)}，` +
      `支付了 ${formatMoney(StockMarketConstants.StockMarketCommission)} 佣金。`;
    helpers.log(ctx, () => resultTxt);
  } else if (!opts.suppressDialog) {
    dialogBoxCreate(
      <>
        以 <Money money={totalPrice} /> 买入了 {stock.symbol} 的 {formatShares(shares)}
        股空头仓位。支付了 <Money money={StockMarketConstants.StockMarketCommission} /> 佣金。
      </>,
    );
  }

  return true;
}

/**
 * Attempt to sell a stock in the short position
 * @param {Stock} stock - Stock to sell
 * @param {number} shares - Number of shares to sell
 * @param {NetscriptContext} ctx - If this is being called through Netscript
 * @param opts - Optional configuration for this function's behavior. See top of file
 * @returns {boolean} true if successfully sells given amount OR max owned, false otherwise
 */
export function sellShort(
  stock: Stock,
  shares: number,
  ctx: NetscriptContext | null = null,
  opts: IOptions = {},
): boolean {
  if (stock == null || isNaN(shares) || shares < 0) {
    if (ctx) {
      helpers.log(ctx, () => `参数无效：股票='${stock?.name}' 数量='${shares}'`);
    } else if (!opts.suppressDialog) {
      dialogBoxCreate(
        "卖出股票空头仓位失败。这可能是" +
          "数量无效所致；否则这可能是个 bug，请联系开发者",
      );
    }

    return false;
  }
  shares = Math.round(shares);
  if (shares > stock.playerShortShares) {
    shares = stock.playerShortShares;
  }
  if (shares === 0) {
    return false;
  }

  const origCost = shares * stock.playerAvgShortPx;
  const totalGain = getSellTransactionGain(stock, shares, PositionType.Short);
  if (totalGain == null || isNaN(totalGain) || origCost == null) {
    if (ctx) {
      helpers.log(
        ctx,
        () => `卖出股票空头仓位失败。这很可能是由于参数无效或 bug 所致`,
      );
    } else if (!opts.suppressDialog) {
      dialogBoxCreate(
        `卖出股票空头仓位失败。这很可能是由于参数无效或 bug 所致`,
      );
    }

    return false;
  }
  let profit = totalGain - origCost;
  if (isNaN(profit)) {
    profit = 0;
  }
  Player.gainMoney(totalGain, "stock");
  if (ctx) {
    ctx.workerScript.scriptRef.onlineMoneyMade += profit;
    Player.scriptProdSinceLastAug += profit;
  }

  stock.playerShortShares = Math.round(stock.playerShortShares - shares);
  if (stock.playerShortShares === 0) {
    stock.playerAvgShortPx = 0;
  }
  processTransactionForecastMovement(stock, shares);

  if (opts.rerenderFn != null && typeof opts.rerenderFn === "function") {
    opts.rerenderFn();
  }

  if (ctx) {
    const resultTxt =
      `卖出了 ${stock.symbol} 的 ${formatShares(shares)} 股空头仓位。` +
      `扣除佣金后，你总共获得了 ${formatMoney(totalGain)}。`;
    helpers.log(ctx, () => resultTxt);
  } else if (!opts.suppressDialog) {
    dialogBoxCreate(
      <>
        卖出了 {stock.symbol} 的 {formatShares(shares)} 股空头仓位。扣除佣金后，你总共获得了{" "}
        <Money money={totalGain} />
      </>,
    );
  }

  return true;
}
