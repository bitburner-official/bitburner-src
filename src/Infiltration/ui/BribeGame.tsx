import { Paper, Typography } from "@mui/material";
import React from "react";
import type { Infiltration } from "../Infiltration";
import type { BribeModel } from "../model/BribeModel";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { downArrowSymbol, upArrowSymbol } from "../utils";

interface IProps {
  state: Infiltration;
  stage: BribeModel;
}

export function BribeGame({ stage }: IProps): React.ReactElement {
  const currentChoice = stage.choices[stage.index];
  const defaultColor = Settings.theme.primary;
  const disabledColor = Settings.theme.disabled;
  let upColor = defaultColor;
  let downColor = defaultColor;
  let choiceColor = defaultColor;
  const hasAugment = Player.hasAugmentation(AugmentationName.BeautyOfAphrodite, true);

  if (hasAugment) {
    const upIndex = stage.index + 1 >= stage.choices.length ? 0 : stage.index + 1;
    let upDistance = stage.correctIndex - upIndex;
    if (upIndex > stage.correctIndex) {
      upDistance = stage.choices.length - 1 - upIndex + stage.correctIndex;
    }

    const downIndex = stage.index - 1 < 0 ? stage.choices.length - 1 : stage.index - 1;
    let downDistance = downIndex - stage.correctIndex;
    if (downIndex < stage.correctIndex) {
      downDistance = downIndex + stage.choices.length - 1 - stage.correctIndex;
    }

    const onCorrectIndex = stage.correctIndex === stage.index;

    upColor = upDistance <= downDistance && !onCorrectIndex ? upColor : disabledColor;
    downColor = upDistance >= downDistance && !onCorrectIndex ? downColor : disabledColor;
    choiceColor = onCorrectIndex ? defaultColor : disabledColor;
  }

  return (
    <>
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">Say something nice about the guard</Typography>
        <Typography variant="h5" color={upColor}>
          {upArrowSymbol}
        </Typography>
        <Typography variant="h5" color={choiceColor}>
          {currentChoice}
        </Typography>
        <Typography variant="h5" color={downColor}>
          {downArrowSymbol}
        </Typography>
      </Paper>
    </>
  );
}
