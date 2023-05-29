import * as React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { Money } from "../../ui/React/Money";
import { formatShares } from "../../ui/formatNumber";
import { Order } from "../Order";
import { cancelOrder } from "../StockMarket";
import { PositionTypes } from "../data/PositionTypes";

interface IProps {
  order: Order;
}

/** React component for displaying a single order in a stock's order book */
export function StockTickerOrder(props: IProps): React.ReactElement {
  function handleCancelOrderClick(): void {
    cancelOrder({ order: props.order });
  }

  const order = props.order;

  const posTxt = order.pos === PositionTypes.Long ? "Long Position" : "Short Position";
  const txt = (
    <>
      {order.type} - {posTxt} - {formatShares(order.shares)} @ <Money money={order.price} />
    </>
  );

  return (
    <Box display="flex" alignItems="center">
      <Typography>{txt}</Typography>
      <Button onClick={handleCancelOrderClick}>Cancel Order</Button>
    </Box>
  );
}
