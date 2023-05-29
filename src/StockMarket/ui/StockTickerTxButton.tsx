/**
 * React Component for a button that initiates a transaction on the Stock Market UI
 * (Buy, Sell, Buy Max, etc.)
 */
import * as React from "react";

import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

interface IProps {
  onClick: () => void;
  text: string;
  tooltip?: JSX.Element | null;
}

export function StockTickerTxButton(props: IProps): React.ReactElement {
  return (
    <Tooltip title={props.tooltip != null ? <Typography>{props.tooltip}</Typography> : ""}>
      <Button onClick={props.onClick}>{props.text}</Button>
    </Tooltip>
  );
}
