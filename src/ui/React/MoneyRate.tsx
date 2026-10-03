import React from "react";
import { formatMoney } from "../formatNumber";
import { Typography } from "@mui/material";


export function MoneyRate({
  money,
  useExponentialFormForSmallValue,
}: {
  money: number;
  useExponentialFormForSmallValue?: boolean;
}): JSX.Element {
  return (
    <Typography component="span" sx={{ color: (theme) => theme.colors.money }}>
      {formatMoney(money, useExponentialFormForSmallValue)} / sec
    </Typography>
  );
}
