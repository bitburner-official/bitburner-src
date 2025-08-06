import * as React from "react";
import { formatMoney } from "../formatNumber";
import { Player } from "@player";
import type { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) => ({
  unbuyable: {
    color: theme.palette.action.disabled,
  },
  money: {
    color: theme.colors.money,
  },
}));

interface IProps {
  money: number;
  forPurchase?: boolean;
}
export function Money(props: IProps): React.ReactElement {
  const { classes } = useStyles();
  return (
    <span className={props.forPurchase && !Player.canAfford(props.money) ? classes.unbuyable : classes.money}>
      {formatMoney(props.money)}
    </span>
  );
}
