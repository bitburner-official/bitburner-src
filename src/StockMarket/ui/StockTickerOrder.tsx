import * as React from "react";

import { Order } from "../Order";
import { PositionType } from "@enums";

import { formatShares } from "../../ui/formatNumber";
import { Money } from "../../ui/React/Money";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { cancelOrder } from "../StockMarket";

interface IProps {
  order: Order;
}

/** React component for displaying a single order in a stock's order book */
export function StockTickerOrder(props: IProps): React.ReactElement {
  function handleCancelOrderClick(): void {
    cancelOrder({ order: props.order });
  }

  const order = props.order;

  const posTxt = order.pos === PositionType.Long ? "Long Position" : "Short Position";
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
