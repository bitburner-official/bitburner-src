import * as React from "react";
import { formatMoney } from "../formatNumber";
import { Player } from "@player";
import { Typography } from "@mui/material";

interface IProps {
  money: number;
  forPurchase?: boolean;
}
export function Money(props: IProps): React.ReactElement {
  return (
    <Typography
      component="span"
      sx={(theme) => ({
        color: props.forPurchase && !Player.canAfford(props.money) ? theme.palette.action.disabled : theme.colors.money,
      })}
    >
      {formatMoney(props.money)}
    </Typography>
  );
}
