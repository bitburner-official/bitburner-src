import type { Bladeburner } from "../Bladeburner";
import type { GeneralAction } from "../Actions/GeneralAction";

import React from "react";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Player } from "@player";
import { CopyableText } from "../../ui/React/CopyableText";
import { StartButton } from "./StartButton";
import { StopButton } from "./StopButton";
import { Box, Paper, Typography } from "@mui/material";
import { useRerender } from "../../ui/React/hooks";

interface GeneralActionElemProps {
  bladeburner: Bladeburner;
  action: GeneralAction;
}

export function GeneralActionElem({ bladeburner, action }: GeneralActionElemProps): React.ReactElement {
  const rerender = useRerender();
  const isActive = action.name === bladeburner.action?.name;
  const computedActionTimeCurrent = Math.min(
    bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow,
    bladeburner.actionTimeToComplete,
  );
  const actionTime = action.getActionTime(bladeburner, Player);
  const successChance =
    action.name === "Recruitment" ? Math.max(0, Math.min(bladeburner.getRecruitmentSuccessChance(Player), 1)) : -1;

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
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
      ) : (
        <Box display="flex" flexDirection="row" alignItems="center">
          <CopyableText value={action.name} />
          <StartButton bladeburner={bladeburner} action={action} rerender={rerender} />
        </Box>
      )}
      <br />
      <br />
      <Typography>{action.desc}</Typography>
      <br />
      <br />
      <Typography>
        Time Required: {convertTimeMsToTimeElapsedString(actionTime * 1000)}
        {successChance !== -1 && (
          <>
            <br />
            Estimated success chance: {formatNumberNoSuffix(successChance * 100, 1)}%
          </>
        )}
      </Typography>
    </Paper>
  );
}
