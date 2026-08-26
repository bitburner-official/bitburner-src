/**
 * React Component for the text on a stock ticker that display's information
 * about the player's position in that stock
 */
import * as React from "react";

import { Stock } from "../Stock";

import { Player } from "@player";
import { formatPercent, formatShares } from "../../ui/formatNumber";
import { Money } from "../../ui/React/Money";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

interface IProps {
  stock: Stock;
}

function LongPosition(props: IProps): React.ReactElement {
  const stock = props.stock;

  // Calculate total returns
  const totalCost = stock.playerShares * stock.playerAvgPx;
  const gains = (stock.getBidPrice() - stock.playerAvgPx) * stock.playerShares;
  let percentageGains = gains / totalCost;
  if (isNaN(percentageGains)) {
    percentageGains = 0;
  }

  return (
    <>
      <Box display="flex">
        <Tooltip
          title={
            <Typography>做多持仓的股份会在对应股票价格上涨时增值</Typography>
          }
        >
          <Typography variant="h5" color="primary">
            做多持仓：
          </Typography>
        </Tooltip>
      </Box>
      <Typography>股份：{formatShares(stock.playerShares)}</Typography>
      <Typography>
        平均价格：<Money money={stock.playerAvgPx} />（总成本：<Money money={totalCost} />）
      </Typography>
      <Typography>
        利润：<Money money={gains} />（{formatPercent(percentageGains)}）
      </Typography>
    </>
  );
}

function ShortPosition(props: IProps): React.ReactElement {
  const stock = props.stock;

  // Calculate total returns
  const totalCost = stock.playerShortShares * stock.playerAvgShortPx;
  const gains = (stock.playerAvgShortPx - stock.getAskPrice()) * stock.playerShortShares;
  let percentageGains = gains / totalCost;
  if (isNaN(percentageGains)) {
    percentageGains = 0;
  }

  if (Player.bitNodeN === 8 || Player.activeSourceFileLvl(8) >= 2) {
    return (
      <>
        <Box display="flex">
          <Tooltip
            title={
              <Typography>做空持仓的股份会在对应股票价格下跌时增值</Typography>
            }
          >
            <Typography variant="h5" color="primary">
              做空持仓：
            </Typography>
          </Tooltip>
        </Box>

        <Typography>股份：{formatShares(stock.playerShortShares)}</Typography>
        <Typography>
          平均价格：<Money money={stock.playerAvgShortPx} />（总成本：<Money money={totalCost} />）
        </Typography>
        <Typography>
          利润：<Money money={gains} />（{formatPercent(percentageGains)}）
        </Typography>
      </>
    );
  } else {
    return <></>;
  }
}

export function StockTickerPositionText(props: IProps): React.ReactElement {
  const stock = props.stock;

  return (
    <>
      <Typography>最大股份：{formatShares(stock.maxShares)}</Typography>
      <Typography>
        买入价：<Money money={stock.getAskPrice()} />
      </Typography>
      <br />
      <Typography>
        卖出价：<Money money={stock.getBidPrice()} />
      </Typography>
      <LongPosition {...props} />
      <ShortPosition {...props} />
    </>
  );
}
