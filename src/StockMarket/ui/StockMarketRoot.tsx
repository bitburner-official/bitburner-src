import React from "react";

import { InfoAndPurchases } from "./InfoAndPurchases";
import { StockTickers } from "./StockTickers";

import { IStockMarket } from "../IStockMarket";

import { Player } from "@player";
import { useRerender } from "../../ui/React/hooks";

type IProps = {
  stockMarket: IStockMarket;
};

/** Root React component for the Stock Market UI */
export function StockMarketRoot(props: IProps): React.ReactElement {
  const rerender = useRerender(200);
  return (
    <>
      <InfoAndPurchases rerender={rerender} />
      {Player.hasWseAccount && <StockTickers stockMarket={props.stockMarket} />}
    </>
  );
}
