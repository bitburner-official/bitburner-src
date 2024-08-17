import React from "react";

import { InfoAndPurchases } from "./InfoAndPurchases";
import { StockTickers } from "./StockTickers";

import { IStockMarket } from "../IStockMarket";

import { Player } from "@player";
import { useCycleRerender } from "../../ui/React/hooks";

interface IProps {
  stockMarket: IStockMarket;
}

/** Root React component for the Stock Market UI */
export function StockMarketRoot(props: IProps): React.ReactElement {
  const rerender = useCycleRerender();
  return (
    <>
      <InfoAndPurchases rerender={rerender} />
      {Player.hasWseAccount && <StockTickers stockMarket={props.stockMarket} />}
    </>
  );
}
