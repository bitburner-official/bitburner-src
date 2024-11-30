/**
 * Helper functions for determine whether Limit and Stop orders should
 * be executed (and executing them)
 */
import { buyStock, sellStock, shortStock, sellShort } from "./BuyingAndSelling";
import { IOrderBook } from "./IOrderBook";
import { IStockMarket } from "./IStockMarket";
import { Order } from "./Order";
import { Stock } from "./Stock";

import { PositionType, OrderType } from "@enums";

import { formatShares } from "../ui/formatNumber";
import { Money } from "../ui/React/Money";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Settings } from "../Settings/Settings";

import * as React from "react";
import { throwIfReachable } from "../utils/helpers/throwIfReachable";

export interface IProcessOrderRefs {
  stockMarket: IStockMarket;
  symbolToStockMap: Record<string, Stock>;
}

/**
 * Search for all orders of a specific type and execute them if appropriate
 * @param {Stock} stock - Stock for which orders should be processed
 * @param {OrderType} orderType - Type of order to check (Limit/Stop buy/sell)
 * @param {PositionType} posType - Long or short
 * @param {IProcessOrderRefs} refs - References to objects/functions that are required for this function
 */
export function processOrders(
  stock: Stock,
  orderType: OrderType,
  posType: PositionType,
  refs: IProcessOrderRefs,
): void {
  const orderBook = refs.stockMarket.Orders;
  if (orderBook == null) {
    const orders: IOrderBook = {};
    for (const name of Object.keys(refs.stockMarket)) {
      const stock = refs.stockMarket[name];
      if (!(stock instanceof Stock)) {
        continue;
      }
      orders[stock.symbol] = [];
    }
    refs.stockMarket.Orders = orders;
    return; // Newly created, so no orders to process
  }
  let stockOrders = orderBook[stock.symbol];
  if (stockOrders == null || !Array.isArray(stockOrders)) {
    console.error(`Invalid Order book for ${stock.symbol} in processOrders(). stockOrders: ${stockOrders}`);
    stockOrders = [];
    return;
  }

  for (const order of stockOrders) {
    if (order.type === orderType && order.pos === posType) {
      switch (order.type) {
        case OrderType.LimitBuy:
          if (order.pos === PositionType.Long && stock.price <= order.price) {
            executeOrder(/*66*/ order, refs);
          } else if (order.pos === PositionType.Short && stock.price >= order.price) {
            executeOrder(/*66*/ order, refs);
          }
          break;
        case OrderType.LimitSell:
          if (order.pos === PositionType.Long && stock.price >= order.price) {
            executeOrder(/*66*/ order, refs);
          } else if (order.pos === PositionType.Short && stock.price <= order.price) {
            executeOrder(/*66*/ order, refs);
          }
          break;
        case OrderType.StopBuy:
          if (order.pos === PositionType.Long && stock.price >= order.price) {
            executeOrder(/*66*/ order, refs);
          } else if (order.pos === PositionType.Short && stock.price <= order.price) {
            executeOrder(/*66*/ order, refs);
          }
          break;
        case OrderType.StopSell:
          if (order.pos === PositionType.Long && stock.price <= order.price) {
            executeOrder(/*66*/ order, refs);
          } else if (order.pos === PositionType.Short && stock.price >= order.price) {
            executeOrder(/*66*/ order, refs);
          }
          break;
        default:
          throwIfReachable(order.type);
      }
    }
  }
}

/**
 * Execute a Stop or Limit Order.
 * @param {Order} order - Order being executed
 * @param {IProcessOrderRefs} refs - References to objects/functions that are required for this function
 */
function executeOrder(order: Order, refs: IProcessOrderRefs): void {
  const stock = refs.symbolToStockMap[order.stockSymbol];
  if (!(stock instanceof Stock)) {
    console.error(`Could not find stock for this order: ${order.stockSymbol}`);
    return;
  }
  const stockMarket = refs.stockMarket;
  const orderBook = stockMarket.Orders;
  const stockOrders = orderBook[stock.symbol];

  // When orders are executed, the buying and selling functions shouldn't
  // emit popup dialog boxes. This options object configures the functions for that
  const opts = {
    suppressDialog: true,
  };

  let res = true;
  let isBuy = false;
  switch (order.type) {
    case OrderType.LimitBuy:
    case OrderType.StopBuy:
      isBuy = true;
      if (order.pos === PositionType.Long) {
        res = buyStock(stock, order.shares, null, opts) && res;
      } else if (order.pos === PositionType.Short) {
        res = shortStock(stock, order.shares, null, opts) && res;
      }
      break;
    case OrderType.LimitSell:
    case OrderType.StopSell:
      if (order.pos === PositionType.Long) {
        res = sellStock(stock, order.shares, null, opts) && res;
      } else if (order.pos === PositionType.Short) {
        res = sellShort(stock, order.shares, null, opts) && res;
      }
      break;
    default:
      throwIfReachable(order.type);
  }

  // Position type, for logging/message purposes
  const pos = order.pos === PositionType.Long ? "Long" : "Short";

  if (res) {
    for (let i = 0; i < stockOrders.length; ++i) {
      if (order == stockOrders[i]) {
        stockOrders.splice(i, 1);
        if (!Settings.SuppressTIXPopup) {
          dialogBoxCreate(
            <>
              {order.type} for {stock.symbol} @ <Money money={order.price} /> ({pos}) was filled (
              {formatShares(Math.round(order.shares))} shares)
            </>,
          );
        }
        return;
      }
    }

    console.error("Could not find the following Order in Order Book: ");
    console.error(order);
  } else if (isBuy) {
    dialogBoxCreate(
      <>
        Failed to execute {order.type} for {stock.symbol} @ <Money money={order.price} /> ({pos}). This is most likely
        because you do not have enough money or the order would exceed the stock's maximum number of shares
      </>,
    );
  }
}
