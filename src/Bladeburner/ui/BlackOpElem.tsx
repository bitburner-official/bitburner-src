import React from "react";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { ActionTypes } from "../data/ActionTypes";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { TeamSizeButton } from "./TeamSizeButton";
import { Bladeburner } from "../Bladeburner";
import { BlackOperation } from "../BlackOperation";
import { BlackOperations } from "../data/BlackOperations";
import { Player } from "@player";
import { CopyableText } from "../../ui/React/CopyableText";
import { SuccessChance } from "./SuccessChance";
import { StartButton } from "./StartButton";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useRerender } from "../../ui/React/hooks";

interface IProps {
  bladeburner: Bladeburner;
  action: BlackOperation;
}

export function BlackOpElem(props: IProps): React.ReactElement {
  const rerender = useRerender();
  const isCompleted = props.bladeburner.blackops[props.action.name] != null;
  if (isCompleted) {
    return (
      <Paper sx={{ my: 1, p: 1 }}>
        <Typography>{props.action.name} (COMPLETED)</Typography>
      </Paper>
    );
  }

  const isActive =
    props.bladeburner.action.type === ActionTypes["BlackOperation"] &&
    props.action.name === props.bladeburner.action.name;
  const actionTime = props.action.getActionTime(props.bladeburner, Player);
  const hasReqdRank = props.bladeburner.rank >= props.action.reqdRank;
  const computedActionTimeCurrent = Math.min(
    props.bladeburner.actionTimeCurrent + props.bladeburner.actionTimeOverflow,
    props.bladeburner.actionTimeToComplete,
  );

  const actionData = BlackOperations[props.action.name];
  if (actionData === undefined) {
    throw new Error(`Cannot find data for ${props.action.name}`);
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
        <>
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
        </>
      ) : (
        <>
          <CopyableText value={props.action.name} />

          <StartButton
            bladeburner={props.bladeburner}
            type={ActionTypes.BlackOperation}
            name={props.action.name}
            rerender={rerender}
          />
          <TeamSizeButton action={props.action} bladeburner={props.bladeburner} />
        </>
      )}

      <br />
      <br />
      <Typography>{actionData.desc}</Typography>
      <br />
      <br />
      <Typography color={hasReqdRank ? "primary" : "error"}>
        Required Rank: {formatNumberNoSuffix(props.action.reqdRank, 0)}
      </Typography>
      <br />
      <Typography>
        <SuccessChance action={props.action} bladeburner={props.bladeburner} />
        <br />
        Time Required: {convertTimeMsToTimeElapsedString(actionTime * 1000)}
      </Typography>
    </Paper>
  );
}
