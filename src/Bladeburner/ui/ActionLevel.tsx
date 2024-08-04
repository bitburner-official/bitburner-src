import type { Bladeburner } from "../Bladeburner";
import type { LevelableAction } from "../Types";

import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { BladeburnerConstants } from "../data/Constants";
import { Contract } from "../Actions";

interface ActionLevelProps {
  action: LevelableAction;
  isActive: boolean;
  bladeburner: Bladeburner;
  rerender: () => void;
}

export function ActionLevel({ action, isActive, bladeburner, rerender }: ActionLevelProps): React.ReactElement {
  const canIncrease = action.level < action.maxLevel;
  const canDecrease = action.level > 1;
  const successesNeededForNextLevel = action.getSuccessesNeededForNextLevel(
    action instanceof Contract
      ? BladeburnerConstants.ContractSuccessesPerLevel
      : BladeburnerConstants.OperationSuccessesPerLevel,
  );

  function increaseLevel(): void {
    if (!canIncrease) return;
    ++action.level;
    if (isActive) bladeburner.startAction(bladeburner.action);
    rerender();
  }

  function decreaseLevel(): void {
    if (!canDecrease) return;
    --action.level;
    if (isActive) bladeburner.startAction(bladeburner.action);
    rerender();
  }

  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <Box display="flex">
        <Tooltip title={<Typography>{successesNeededForNextLevel} successes needed for next level</Typography>}>
          <Typography>
            Level: {action.level} / {action.maxLevel}
          </Typography>
        </Tooltip>
      </Box>
      <Tooltip title={isActive ? <Typography>WARNING: changing the level will restart the Operation</Typography> : ""}>
        <span>
          <IconButton disabled={!canIncrease} onClick={increaseLevel}>
            <ArrowDropUpIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={isActive ? <Typography>WARNING: changing the level will restart the Operation</Typography> : ""}>
        <span>
          <IconButton disabled={!canDecrease} onClick={decreaseLevel}>
            <ArrowDropDownIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
