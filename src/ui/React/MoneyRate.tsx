import React from "react";
import { formatMoney } from "../formatNumber";
import { Box } from "@mui/material";

export function MoneyRate({
  money,
  useExponentialFormForSmallValue,
}: {
  money: number;
  useExponentialFormForSmallValue?: boolean;
}): JSX.Element {
  return (
    <Box component="span" sx={(theme) => ({ color: theme.colors.money })}>
      {formatMoney(money, useExponentialFormForSmallValue)} / sec
    </Box>
  );
}
