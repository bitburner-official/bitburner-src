import * as React from "react";
import { formatMoney } from "../../ui/formatNumber";
import { Corporation } from "../Corporation";
import { Typography } from "@mui/material";

interface IProps {
  money: number;
  corp: Corporation;
}

export function MoneyCost(props: IProps): React.ReactElement {
  if (!(props.corp.funds > props.money))
    return (
      <Typography component="span" sx={{ color: (theme) => theme.palette.action.disabled }}>
        {formatMoney(props.money)}
      </Typography>
    );

  return (
    <Typography component="span" sx={{ color: (theme) => theme.colors.money }}>
      {formatMoney(props.money)}
    </Typography>
  );
}
