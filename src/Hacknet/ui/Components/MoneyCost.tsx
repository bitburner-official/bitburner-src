import * as React from "react";
import { formatMoney } from "../../../ui/formatNumber";
import type { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";

const useStyles = makeStyles()((theme: Theme) => ({
  unbuyable: {
    color: theme.palette.action.disabled,
  },
  money: {
    color: theme.colors.money,
  },
}));

interface IProps {
  cost: number;
}

export function MoneyCost({ cost }: IProps): React.ReactElement {
  const { classes } = useStyles();
  const canAfford = usePlayerSelector(React.useCallback((p: PlayerObject) => p.canAfford(cost), [cost]));
  return <span className={canAfford ? classes.money : classes.unbuyable}>{formatMoney(cost)}</span>;
}
