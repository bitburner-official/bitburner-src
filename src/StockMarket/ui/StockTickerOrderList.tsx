/**
 * React component for displaying a stock's order list in the Stock Market UI.
 * This component resides in the stock ticker
 */
import * as React from "react";

import { Order } from "../Order";
import { Stock } from "../Stock";
import { StockTickerOrder } from "./StockTickerOrder";

interface IProps {
  orders: Order[];
  stock: Stock;
}

export function StockTickerOrderList(props: IProps): React.ReactElement {
  const orders: React.ReactElement[] = [];
  for (let i = 0; i < props.orders.length; ++i) {
    const o = props.orders[i];
    orders.push(<StockTickerOrder order={o} key={i} />);
  }

  return <>{orders}</>;
}
