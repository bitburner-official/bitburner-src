import React from "react";
import { ActionTypes } from "../data/ActionTypes";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Contracts } from "../data/Contracts";
import { Bladeburner } from "../Bladeburner";
import { Action } from "../Action";
import { Player } from "@player";
import { SuccessChance } from "./SuccessChance";
import { CopyableText } from "../../ui/React/CopyableText";
import { ActionLevel } from "./ActionLevel";
import { Autolevel } from "./Autolevel";
import { StartButton } from "./StartButton";
import { formatNumberNoSuffix, formatBigNumber } from "../../ui/formatNumber";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useRerender } from "../../ui/React/hooks";

interface IProps {
  bladeburner: Bladeburner;
  action: Action;
}

export function ContractElem(props: IProps): React.ReactElement {
  const rerender = useRerender();
  const isActive =
    props.bladeburner.action.type === ActionTypes["Contract"] && props.action.name === props.bladeburner.action.name;
  const computedActionTimeCurrent = Math.min(
    props.bladeburner.actionTimeCurrent + props.bladeburner.actionTimeOverflow,
    props.bladeburner.actionTimeToComplete,
  );
  const actionTime = props.action.getActionTime(props.bladeburner, Player);

  const actionData = Contracts[props.action.name];
  if (actionData === undefined) {
    throw new Error(`Cannot find data for ${props.action.name}`);
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
        <>
          <Typography>
            <CopyableText value={props.action.name} /> (IN PROGRESS -{" "}
            {formatNumberNoSuffix(computedActionTimeCurrent, 0)} /{" "}
            {formatNumberNoSuffix(props.bladeburner.actionTimeToComplete, 0)})
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
            type={ActionTypes.Contract}
            name={props.action.name}
            rerender={rerender}
          />
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
        Contracts remaining: {formatBigNumber(Math.floor(props.action.count))}
        <br />
        Successes: {formatBigNumber(props.action.successes)}
        <br />
        Failures: {formatBigNumber(props.action.failures)}
      </Typography>
      <br />
      <Autolevel rerender={rerender} action={props.action} />
    </Paper>
  );
}
