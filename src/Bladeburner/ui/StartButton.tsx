import React from "react";
import { Button } from "@mui/material";

import { Player } from "@player";
import { AugmentationName, BladeActionType, BladeOperationName } from "@enums";
import { Bladeburner } from "../Bladeburner";
import { ActionIdentifier } from "../Actions/ActionIdentifier";

interface StartButtonProps {
  bladeburner: Bladeburner;
  actionId: ActionIdentifier;
  rerender: () => void;
}
export function StartButton({ bladeburner, actionId, rerender }: StartButtonProps): React.ReactElement {
  const action = bladeburner.getActionObject(actionId);
  const disabled = ((): boolean => {
    switch (action.type) {
      case BladeActionType.general:
        return false;
      case BladeActionType.contract:
      case BladeActionType.operation:
        return (
          action.count < 1 || (bladeburner.getCurrentCity().comms === 0 && action.name === BladeOperationName.raid)
        );
      case BladeActionType.blackOp:
        return bladeburner.numBlackOpsComplete !== action.id || bladeburner.rank < action.reqdRank;
    }
  })();

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
