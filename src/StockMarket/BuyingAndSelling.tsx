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

import { CONSTANTS } from "../Constants";
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
      helpers.log(ctx, () => `Invalid arguments: stock='${stock}' shares='${shares}'`);
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate("Failed to buy stock. This may be a bug, contact developer");
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
      helpers.log(
        ctx,
        () => `You do not have enough money to purchase this position. You need ${formatMoney(totalPrice)}.`,
      );
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        <>
          You do not have enough money to purchase this. You need <Money money={totalPrice} />
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
          `Purchasing '${shares + stock.playerShares + stock.playerShortShares}' shares would exceed ${
            stock.symbol
          }'s maximum (${stock.maxShares}) number of shares`,
      );
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        `You cannot purchase this many shares. ${stock.symbol} has a maximum of ${formatShares(
          stock.maxShares,
        )} shares.`,
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
    const resultTxt = `Bought ${formatShares(shares)} shares of ${stock.symbol} for ${formatMoney(
      totalPrice,
    )}. Paid ${formatMoney(StockMarketConstants.StockMarketCommission)} in commission fees.`;
    helpers.log(ctx, () => resultTxt);
  } else if (opts.suppressDialog !== true) {
    dialogBoxCreate(
      <>
        Bought {formatShares(shares)} shares of {stock.symbol} for <Money money={totalPrice} />. Paid{" "}
        <Money money={StockMarketConstants.StockMarketCommission} /> in commission fees.
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
      helpers.log(ctx, () => `Invalid arguments: stock='${stock}' shares='${shares}'`);
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        "Failed to sell stock. This is probably due to an invalid quantity. Otherwise, this may be a bug, contact developer",
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
      `Sold ${formatShares(shares)} shares of ${stock.symbol}. ` +
      `After commissions, you gained a total of ${formatMoney(gains)}.`;
    helpers.log(ctx, () => resultTxt);
  } else if (opts.suppressDialog !== true) {
    dialogBoxCreate(
      <>
        Sold {formatShares(shares)} shares of {stock.symbol}. After commissions, you gained a total of{" "}
        <Money money={gains} />.
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
      helpers.log(ctx, () => `Invalid arguments: stock='${stock}' shares='${shares}'`);
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        "Failed to initiate a short position in a stock. This is probably " +
          "due to an invalid quantity. Otherwise, this may be a bug,  so contact developer",
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
        () => "You do not have enough " + "money to purchase this short position. You need " + formatMoney(totalPrice),
      );
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        <>
          You do not have enough money to purchase this short position. You need <Money money={totalPrice} />
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
          `This '${shares + stock.playerShares + stock.playerShortShares}' short shares would exceed ${
            stock.symbol
          }'s maximum (${stock.maxShares}) number of shares.`,
      );
    } else if (opts.suppressDialog !== true) {
      dialogBoxCreate(
        `You cannot purchase this many shares. ${stock.symbol} has a maximum of ${stock.maxShares} shares.`,
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
      `Bought a short position of ${formatShares(shares)} shares of ${stock.symbol} ` +
      `for ${formatMoney(totalPrice)}. Paid ${formatMoney(StockMarketConstants.StockMarketCommission)} ` +
      `in commission fees.`;
    helpers.log(ctx, () => resultTxt);
  } else if (!opts.suppressDialog) {
    dialogBoxCreate(
      <>
        Bought a short position of {formatShares(shares)} shares of {stock.symbol} for <Money money={totalPrice} />.
        Paid <Money money={StockMarketConstants.StockMarketCommission} /> in commission fees.
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
      helpers.log(ctx, () => `Invalid arguments: stock='${stock}' shares='${shares}'`);
    } else if (!opts.suppressDialog) {
      dialogBoxCreate(
        "Failed to sell a short position in a stock. This is probably " +
          "due to an invalid quantity. Otherwise, this may be a bug, so contact developer",
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
        () => `Failed to sell short position in a stock. This is probably either due to invalid arguments, or a bug`,
      );
    } else if (!opts.suppressDialog) {
      dialogBoxCreate(
        `Failed to sell short position in a stock. This is probably either due to invalid arguments, or a bug`,
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
      `Sold your short position of ${formatShares(shares)} shares of ${stock.symbol}. ` +
      `After commissions, you gained a total of ${formatMoney(totalGain)}`;
    helpers.log(ctx, () => resultTxt);
  } else if (!opts.suppressDialog) {
    dialogBoxCreate(
      <>
        Sold your short position of {formatShares(shares)} shares of {stock.symbol}. After commissions, you gained a
        total of <Money money={totalGain} />
      </>,
    );
  }

  return true;
}
