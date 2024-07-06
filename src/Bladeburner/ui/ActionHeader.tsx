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
import { BladeburnerConstants } from "../data/Constants";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";

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
  const remainingSeconds = Math.max(
    bladeburner.actionTimeToComplete - bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow,
    0,
  );
  const remainingBonusSeconds = Math.floor(bladeburner.storedCycles / BladeburnerConstants.CyclesPerSecond);
  /**
   * Bladeburner is processed every second. Each time it's processed, we use (up to) 4 bonus seconds and process it as
   * if (up to) 5 seconds passed.
   * For example, with 20 bonus seconds, we need 5 seconds to use up all those bonus seconds. After 5 seconds, we used
   * up 20 bonus seconds and processed Bladeburner as if 25 seconds had passed.
   */
  const effectiveBonusSeconds = (remainingBonusSeconds / 4) * 5;
  let eta;
  if (remainingSeconds <= effectiveBonusSeconds) {
    // If we have enough effectiveBonusSeconds, ETA is (remainingSeconds / 5).
    eta = Math.floor(remainingSeconds / 5);
  } else {
    /**
     * For example, let's say we start the "Training" action with 20 bonus seconds: remainingSeconds=30;remainingBonusSeconds=20.
     * After 5 seconds (remainingBonusSeconds / 4), we processed Bladeburner as if 25 seconds (effectiveBonusSeconds)
     * had passed. We still need 5 more seconds (30 - 25 = remainingTime - effectiveBonusSeconds) to complete the action
     * at normal speed.
     *
     * ETA = remainingBonusSeconds / 4 + remainingTime - effectiveBonusSeconds
     *     = remainingBonusSeconds / 4 + remainingTime - ((remainingBonusSeconds / 4) * 5)
     *     = remainingTime - remainingBonusSeconds
     */
    eta = remainingSeconds - remainingBonusSeconds;
  }

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
        <Box display="flex" flexDirection="row" alignItems="center">
          <Typography>
            {createProgressBarText({
              progress: computedActionTimeCurrent / bladeburner.actionTimeToComplete,
            })}
          </Typography>
          <Typography marginLeft="1rem">Remaining time: {convertTimeMsToTimeElapsedString(eta * 1000)}</Typography>
        </Box>
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
