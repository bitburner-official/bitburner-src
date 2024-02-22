import React from "react";

import { Bladeburner } from "../Bladeburner";
import { BlackOperation } from "../BlackOperation";
import { Player } from "@player";
import Button from "@mui/material/Button";
import { AugmentationName } from "@enums";
import { ActionIdentifier } from "../ActionIdentifier";

interface IProps {
  bladeburner: Bladeburner;
  type: number;
  name: string;
  rerender: () => void;
}
export function StartButton(props: IProps): React.ReactElement {
  const action = props.bladeburner.getActionObject(new ActionIdentifier({ name: props.name, type: props.type }));
  if (action == null) {
    throw new Error("Failed to get Operation Object for: " + props.name);
  }
  let disabled = false;
  if (action.count < 1) {
    disabled = true;
  }
  if (props.name === "Raid" && props.bladeburner.getCurrentCity().comms === 0) {
    disabled = true;
  }

  if (action instanceof BlackOperation && props.bladeburner.rank < action.reqdRank) {
    disabled = true;
  }
  function onStart(): void {
    if (disabled) return;
    const action = new ActionIdentifier();
    action.type = props.type;
    action.name = props.name;
    if (!Player.hasAugmentation(AugmentationName.BladesSimulacrum, true)) Player.finishWork(true);
    props.bladeburner.startAction(action);
    props.rerender();
  }

  return (
    <Button sx={{ mx: 1 }} disabled={disabled} onClick={onStart}>
      Start
    </Button>
  );
}
