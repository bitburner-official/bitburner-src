import React from "react";
import { ActionTypes } from "../data/ActionTypes";
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

interface IProps {
  bladeburner: Bladeburner;
  action: Action;
}

export function GeneralActionElem(props: IProps): React.ReactElement {
  const rerender = useRerender();
  const isActive = props.action.name === props.bladeburner.action.name;
  const computedActionTimeCurrent = Math.min(
    props.bladeburner.actionTimeCurrent + props.bladeburner.actionTimeOverflow,
    props.bladeburner.actionTimeToComplete,
  );
  const actionTime = (function (): number {
    switch (props.action.name) {
      case "Training":
      case "Field Analysis":
        return 30;
      case "Diplomacy":
      case "Hyperbolic Regeneration Chamber":
      case "Incite Violence":
        return 60;
      case "Recruitment":
        return props.bladeburner.getRecruitmentTime(Player);
    }
    return -1; // dead code
  })();
  const successChance =
    props.action.name === "Recruitment"
      ? Math.max(0, Math.min(props.bladeburner.getRecruitmentSuccessChance(Player), 1))
      : -1;

  const actionData = GeneralActions[props.action.name];
  if (actionData === undefined) {
    throw new Error(`Cannot find data for ${props.action.name}`);
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
        <>
          <CopyableText value={props.action.name} />
          <Typography>
            (IN PROGRESS - {formatNumberNoSuffix(computedActionTimeCurrent, 0)} /{" "}
            {formatNumberNoSuffix(props.bladeburner.actionTimeToComplete, 0)})
          </Typography>
          <Typography>
            {createProgressBarText({
              progress: computedActionTimeCurrent / props.bladeburner.actionTimeToComplete,
            })}
          </Typography>
        </>
      ) : (
        <Box display="flex" flexDirection="row" alignItems="center">
          <CopyableText value={props.action.name} />
          <StartButton
            bladeburner={props.bladeburner}
            type={ActionTypes[props.action.name]}
            name={props.action.name}
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
