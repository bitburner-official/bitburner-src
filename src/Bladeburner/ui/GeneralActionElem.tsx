import React from "react";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Bladeburner } from "../Bladeburner";
import { Action } from "../Action";
import { GeneralActions } from "../data/GeneralActions";
import { Player } from "@player";
import { CopyableText } from "../../ui/React/CopyableText";

import { StartButton } from "./StartButton";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useRerender } from "../../ui/React/hooks";
import { BladeActionType } from "../Enums";
import { getEnumHelper } from "../../utils/EnumHelper";

interface GeneralActionElemProps {
  bladeburner: Bladeburner;
  action: Action;
}

export function GeneralActionElem({ bladeburner, action }: GeneralActionElemProps): React.ReactElement {
  const rerender = useRerender();
  // Temporary special return case - will be fixed by adding a type for general actions
  if (!getEnumHelper("BladeGeneralActionName").isMember(action.name)) return <></>;
  const isActive = action.name === bladeburner.action?.name;
  const computedActionTimeCurrent = Math.min(
    bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow,
    bladeburner.actionTimeToComplete,
  );
  const actionTime = (function (): number {
    switch (action.name) {
      case "Training":
      case "Field Analysis":
        return 30;
      case "Diplomacy":
      case "Hyperbolic Regeneration Chamber":
      case "Incite Violence":
        return 60;
      case "Recruitment":
        return bladeburner.getRecruitmentTime(Player);
    }
    return -1; // dead code
  })();
  const successChance =
    action.name === "Recruitment" ? Math.max(0, Math.min(bladeburner.getRecruitmentSuccessChance(Player), 1)) : -1;

  const actionData = GeneralActions[action.name];
  if (actionData === undefined) {
    throw new Error(`Cannot find data for ${action.name}`);
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
        <>
          <CopyableText value={action.name} />
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
          <StartButton
            bladeburner={bladeburner}
            actionId={{ type: BladeActionType.general, name: action.name }}
            rerender={rerender}
          />
        </Box>
      )}
      <br />
      <br />
      <Typography>{actionData.desc}</Typography>
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
