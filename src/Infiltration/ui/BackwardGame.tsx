import { Paper, Typography } from "@mui/material";
import React from "react";
import type { Infiltration } from "../Infiltration";
import type { BackwardModel } from "../model/BackwardModel";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { BlinkingCursor } from "./BlinkingCursor";

interface IProps {
  state: Infiltration;
  stage: BackwardModel;
}

export function BackwardGame({ stage }: IProps): React.ReactElement {
  const hasAugment = Player.hasAugmentation(AugmentationName.ChaosOfDionysus, true);

  return (
    <>
      <Paper sx={{ display: "grid", justifyItems: "center", pb: 1 }}>
        <Typography variant="h4">输入所见内容{!hasAugment ? "（反向）" : ""}</Typography>
        <Typography style={{ transform: hasAugment ? "none" : "scaleX(-1)" }}>{stage.answer}</Typography>
        <Typography>
          {stage.guess}
          <BlinkingCursor />
        </Typography>
      </Paper>
    </>
  );
}
