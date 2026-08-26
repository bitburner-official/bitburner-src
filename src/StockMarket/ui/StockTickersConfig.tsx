/**
 * React component for the tickers configuration section of the Stock Market UI.
 * This config lets you change the way stock tickers are displayed (watchlist,
 * all/portfolio mode, etc)
 */
import * as React from "react";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

// numeric enum
export enum TickerDisplayMode {
  AllStocks,
  Portfolio,
}

interface IProps {
  changeDisplayMode: () => void;
  changeWatchlistFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tickerDisplayMode: TickerDisplayMode;
}

function DisplayModeButton(props: IProps): React.ReactElement {
  let txt = "";
  let tooltip = "";
  if (props.tickerDisplayMode === TickerDisplayMode.Portfolio) {
    txt = "切换到“全部股票”模式";
    tooltip = "显示世界股票交易所（WSE）的所有股票";
  } else {
    txt = "切换到“投资组合”模式";
    tooltip = "仅显示你持有股份或挂有订单的股票";
  }

  return (
    <Tooltip title={<Typography>{tooltip}</Typography>}>
      <Button onClick={props.changeDisplayMode}>{txt}</Button>
    </Tooltip>
  );
}

export function StockTickersConfig(props: IProps): React.ReactElement {
  return (
    <>
      <DisplayModeButton {...props} />
      <br />
      <TextField
        sx={{ width: "100%" }}
        onChange={props.changeWatchlistFilter}
        placeholder="按代码筛选股票（逗号分隔列表）"
        type="text"
      />
    </>
  );
}
