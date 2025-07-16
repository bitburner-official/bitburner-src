import React from "react";
import { formatMoney } from "../formatNumber";
import type { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) => ({
  money: {
    color: theme.colors.money,
  },
}));

export function MoneyRate({ money }: { money: number }): JSX.Element {
  const { classes } = useStyles();
  return <span className={classes.money}>{formatMoney(money)} / sec</span>;
}
