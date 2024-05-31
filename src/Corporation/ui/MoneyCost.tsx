import * as React from "react";
import { formatMoney } from "../../ui/formatNumber";
import { Corporation } from "../Corporation";
import { Theme } from "@mui/material/styles";
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
  corp: Corporation;
}

export function MoneyCost(props: IProps): React.ReactElement {
  const { classes } = useStyles();
  if (!(props.corp.funds > props.money)) return <span className={classes.unbuyable}>{formatMoney(props.money)}</span>;

  return <span className={classes.money}>{formatMoney(props.money)}</span>;
}
