import React from "react";

import { Bladeburner } from "../Bladeburner";
import { BlackOperation } from "../BlackOperation";
import { Player } from "@player";
import Button from "@mui/material/Button";
import { AugmentationName, BladeOperationName } from "@enums";
import { ActionIdentifier } from "../ActionIdentifier";

interface StartButtonProps {
  bladeburner: Bladeburner;
  actionId: ActionIdentifier;
  rerender: () => void;
}
export function StartButton({ bladeburner, actionId, rerender }: StartButtonProps): React.ReactElement {
  const action = bladeburner.getActionObject(actionId);
  let disabled = false;
  if (action.count < 1) {
    disabled = true;
  }
  if (actionId.name === BladeOperationName.raid && bladeburner.getCurrentCity().comms === 0) {
    disabled = true;
  }

  if (action instanceof BlackOperation && bladeburner.rank < action.reqdRank) {
    disabled = true;
  }
  function onStart(): void {
    if (disabled) return;
    if (!Player.hasAugmentation(AugmentationName.BladesSimulacrum, true)) Player.finishWork(true);
    bladeburner.startAction(actionId);
    rerender();
  }

  return (
    <Button sx={{ mx: 1 }} disabled={disabled} onClick={onStart}>
      Start
    </Button>
  );
}
