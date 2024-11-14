/**
 * Represents a Limit or Buy Order on the stock market. Does not represent
 * a Market Order since those are just executed immediately
 */
import { PositionType, OrderType } from "@enums";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";

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

  /** Serialize the Order to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("Order", this);
  }

  /** Initializes a Order from a JSON save state */
  static fromJSON(value: IReviverValue): Order {
    return Generic_fromJSON(Order, value.data);
  }
}

constructorsForReviver.Order = Order;
