import React from "react";

import { InfoAndPurchases } from "./InfoAndPurchases";
import { StockTickers } from "./StockTickers";

import { IStockMarket } from "../IStockMarket";

import { Player } from "@player";
import { useCycleRerender } from "../../ui/React/hooks";
import Container from "@mui/material/Container";

interface IProps {
  stockMarket: IStockMarket;
}

/** Root React component for the Stock Market UI */
export function StockMarketRoot(props: IProps): React.ReactElement {
  const rerender = useCycleRerender();
  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <InfoAndPurchases rerender={rerender} />
      {Player.hasWseAccount && <StockTickers stockMarket={props.stockMarket} />}
    </Container>
  );
}
