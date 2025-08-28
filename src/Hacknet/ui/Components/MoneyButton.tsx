import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";

type MoneyButtonProps = {
  cost: number;
} & ButtonProps;

export function MoneyButton(props: MoneyButtonProps): React.ReactElement {
  const canAfford = usePlayerSelector(React.useCallback((p: PlayerObject) => p.canAfford(props.cost), [props.cost]));
  return (
    <Button disabled={!canAfford || props.disabled} {...props}>
      {props.children}
    </Button>
  );
}
