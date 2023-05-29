import * as React from "react";

import { Theme } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { Player } from "@player";

import { formatMoney } from "../formatNumber";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    unbuyable: {
      color: theme.palette.action.disabled,
    },
    money: {
      color: theme.colors.money,
    },
  }),
);

interface IProps {
  money: number | string;
  forPurchase?: boolean;
}
export function Money(props: IProps): React.ReactElement {
  const classes = useStyles();
  if (props.forPurchase) {
    if (typeof props.money !== "number")
      throw new Error("if value is for a purchase, money should be number, contact dev");
    if (!Player.canAfford(props.money)) return <span className={classes.unbuyable}>{formatMoney(props.money)}</span>;
  }
  return (
    <span className={classes.money}>{typeof props.money === "number" ? formatMoney(props.money) : props.money}</span>
  );
}
