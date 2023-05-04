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
            <Typography>
              Shares in the long position will increase in value if the price of the corresponding stock increases
            </Typography>
          }
        >
          <Typography variant="h5" color="primary">
            Long Position:
          </Typography>
        </Tooltip>
      </Box>
      <Typography>Shares: {formatShares(stock.playerShares)}</Typography>
      <Typography>
        Average Price: <Money money={stock.playerAvgPx} /> (Total Cost: <Money money={totalCost} />)
      </Typography>
      <Typography>
        Profit: <Money money={gains} /> ({formatPercent(percentageGains)})
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

  if (Player.bitNodeN === 8 || Player.sourceFileLvl(8) >= 2) {
    return (
      <>
        <Box display="flex">
          <Tooltip
            title={
              <Typography>
                Shares in the short position will increase in value if the price of the corresponding stock decreases
              </Typography>
            }
          >
            <Typography variant="h5" color="primary">
              Short Position:
            </Typography>
          </Tooltip>
        </Box>

        <Typography>Shares: {formatShares(stock.playerShortShares)}</Typography>
        <Typography>
          Average Price: <Money money={stock.playerAvgShortPx} /> (Total Cost: <Money money={totalCost} />)
        </Typography>
        <Typography>
          Profit: <Money money={gains} /> ({formatPercent(percentageGains)})
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
      <Typography>Max Shares: {formatShares(stock.maxShares)}</Typography>
      <Typography>
        Ask Price: <Money money={stock.getAskPrice()} />
      </Typography>
      <br />
      <Typography>
        Bid Price: <Money money={stock.getBidPrice()} />
      </Typography>
      <LongPosition {...props} />
      <ShortPosition {...props} />
    </>
  );
}
