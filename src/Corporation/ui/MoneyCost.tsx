import * as React from "react";
import { formatMoney } from "../../ui/formatNumber";
import { Corporation } from "../Corporation";
import Box from "@mui/material/Box";

interface IProps {
  money: number;
  corp: Corporation;
}

export function MoneyCost(props: IProps): React.ReactElement {
  if (!(props.corp.funds > props.money))
    return (
      <Box component="span" sx={{ color: "action.disabled" }}>
        {formatMoney(props.money)}
      </Box>
    );

  return (
    <Box component="span" sx={(theme) => ({ color: theme.colors.money })}>
      {formatMoney(props.money)}
    </Box>
  );
}
