import React, { useState } from "react";
import { ActionTypes } from "../data/ActionTypes";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { SuccessChance } from "./SuccessChance";
import { ActionLevel } from "./ActionLevel";
import { Autolevel } from "./Autolevel";
import { StartButton } from "./StartButton";
import { TeamSizeButton } from "./TeamSizeButton";
import { Bladeburner } from "../Bladeburner";
import { Operation } from "../Operation";
import { Operations } from "../data/Operations";
import { Player } from "@player";
import { CopyableText } from "../../ui/React/CopyableText";
import { formatNumber, formatReallyBigNumber } from "../../ui/nFormat";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

interface IProps {
  bladeburner: Bladeburner;
  action: Operation;
}

export function OperationElem(props: IProps): React.ReactElement {
  const setRerender = useState(false)[1];
  function rerender(): void {
    setRerender((old) => !old);
  }
  const isActive =
    props.bladeburner.action.type === ActionTypes["Operation"] && props.action.name === props.bladeburner.action.name;
  const computedActionTimeCurrent = Math.min(
    props.bladeburner.actionTimeCurrent + props.bladeburner.actionTimeOverflow,
    props.bladeburner.actionTimeToComplete,
  );
  const actionTime = props.action.getActionTime(props.bladeburner, Player);

  const actionData = Operations[props.action.name];
  if (actionData === undefined) {
    throw new Error(`Cannot find data for ${props.action.name}`);
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
        <>
          <Typography>
            <CopyableText value={props.action.name} /> (IN PROGRESS - {formatNumber(computedActionTimeCurrent, 0)} /{" "}
            {formatNumber(props.bladeburner.actionTimeToComplete, 0)})
          </Typography>
          <Typography>
            {createProgressBarText({
              progress: computedActionTimeCurrent / props.bladeburner.actionTimeToComplete,
            })}
          </Typography>
        </>
      ) : (
        <>
          <CopyableText value={props.action.name} />
          <StartButton
            bladeburner={props.bladeburner}
            type={ActionTypes.Operation}
            name={props.action.name}
            rerender={rerender}
          />
          <TeamSizeButton action={props.action} bladeburner={props.bladeburner} />
        </>
      )}
      <br />
      <br />

      <ActionLevel action={props.action} bladeburner={props.bladeburner} isActive={isActive} rerender={rerender} />
      <br />
      <br />
      <Typography>
        {actionData.desc}
        <br />
        <br />
        <SuccessChance action={props.action} bladeburner={props.bladeburner} />
        <br />
        Time Required: {convertTimeMsToTimeElapsedString(actionTime * 1000)}
        <br />
        Operations remaining: {formatReallyBigNumber(Math.floor(props.action.count), 3)}
        <br />
        Successes: {formatReallyBigNumber(props.action.successes, 3)}
        <br />
        Failures: {formatReallyBigNumber(props.action.failures, 3)}
      </Typography>
      <br />
      <Autolevel rerender={rerender} action={props.action} />
    </Paper>
  );
}
