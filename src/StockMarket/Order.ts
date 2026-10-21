/**
 * Represents a Limit or Buy Order on the stock market. Does not represent
 * a Market Order since those are just executed immediately
 */
import { PositionType, OrderType } from "@enums";

import { makeSerializable } from "../utils/GenericReviver";

export class Order {
  readonly pos: PositionType;
  readonly price: number;
  shares: number;
  readonly stockSymbol: string;
  readonly type: OrderType;

  constructor(
    stockSymbol = "",
    shares = 0,
    price = 0,
    typ: OrderType = OrderType.LimitBuy,
    pos: PositionType = PositionType.Long,
  ) {
    // Validate arguments
    let invalidArgs = false;
    if (typeof shares !== "number" || typeof price !== "number") {
      invalidArgs = true;
    }
    if (isNaN(shares) || isNaN(price)) {
      invalidArgs = true;
    }
    if (typeof stockSymbol !== "string") {
      invalidArgs = true;
    }
    if (invalidArgs) {
      throw new Error(`Invalid constructor parameters for Order`);
    }

    this.stockSymbol = stockSymbol;
    this.shares = shares;
    this.price = price;
    this.type = typ;
    this.pos = pos;
  }

  static includedKeys = makeSerializable("Order", Order);
}
