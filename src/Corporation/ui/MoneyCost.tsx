import * as React from "react";
import { formatMoney } from "../../ui/formatNumber";
import { Corporation } from "../Corporation";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";

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
  money: number;
  corp: Corporation;
}

export function MoneyCost(props: IProps): React.ReactElement {
  const classes = useStyles();
  if (!(props.corp.funds > props.money)) return <span className={classes.unbuyable}>{formatMoney(props.money)}</span>;

  return <span className={classes.money}>{formatMoney(props.money)}</span>;
}
