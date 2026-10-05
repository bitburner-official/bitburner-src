import * as React from "react";
import { formatMoney } from "../../ui/formatNumber";
import { Corporation } from "../Corporation";
import { styled } from "@mui/material/styles";

const ActionDisabled = styled("span")((theme) => ({ color: theme.theme.palette.action.disabled }));
const ActionEnabled = styled("span")((theme) => ({ color: theme.theme.colors.money }));

interface IProps {
  money: number;
  corp: Corporation;
}

export function MoneyCost(props: IProps): React.ReactElement {
  if (!(props.corp.funds > props.money)) return <ActionDisabled>{formatMoney(props.money)}</ActionDisabled>;

  return <ActionEnabled>{formatMoney(props.money)}</ActionEnabled>;
}
