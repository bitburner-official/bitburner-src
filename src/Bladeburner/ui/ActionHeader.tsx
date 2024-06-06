import type { Bladeburner } from "../Bladeburner";
import type { Action } from "../Types";

import React from "react";
import { Box, Typography } from "@mui/material";
import { CopyableText } from "../../ui/React/CopyableText";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { StartButton } from "./StartButton";
import { StopButton } from "./StopButton";
import { TeamSizeButton } from "./TeamSizeButton";

import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { BlackOperation, Operation } from "../Actions";

interface ActionHeaderProps {
  bladeburner: Bladeburner;
  action: Action;
  rerender: () => void;
}
export function ActionHeader({ bladeburner, action, rerender }: ActionHeaderProps): React.ReactElement {
  const isActive = action.name === bladeburner.action?.name;
  const computedActionTimeCurrent = Math.min(
    bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow,
    bladeburner.actionTimeToComplete,
  );
  const allowTeam = action instanceof Operation || action instanceof BlackOperation;

  if (isActive) {
    return (
      <>
        <Box display="flex" flexDirection="row" alignItems="center">
          <CopyableText value={action.name} />
          <StopButton bladeburner={bladeburner} rerender={rerender} />
        </Box>
        <Typography>
          (IN PROGRESS - {formatNumberNoSuffix(computedActionTimeCurrent, 0)} /{" "}
          {formatNumberNoSuffix(bladeburner.actionTimeToComplete, 0)})
        </Typography>
        <Typography>
          {createProgressBarText({
            progress: computedActionTimeCurrent / bladeburner.actionTimeToComplete,
          })}
        </Typography>
      </>
    );
  }

  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <CopyableText value={action.name} />
      <StartButton bladeburner={bladeburner} action={action} rerender={rerender} />
      {allowTeam && <TeamSizeButton bladeburner={bladeburner} action={action} />}
    </Box>
  );
}
