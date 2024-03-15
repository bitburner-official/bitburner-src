import React from "react";
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
import { formatNumberNoSuffix, formatBigNumber } from "../../ui/formatNumber";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useRerender } from "../../ui/React/hooks";
import { BladeActionType } from "../Enums";

interface OperationElemProps {
  bladeburner: Bladeburner;
  operation: Operation;
}

export function OperationElem({ bladeburner, operation }: OperationElemProps): React.ReactElement {
  const rerender = useRerender();
  const isActive =
    bladeburner.action?.type === BladeActionType.operation && operation.name === bladeburner.action?.name;
  const computedActionTimeCurrent = Math.min(
    bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow,
    bladeburner.actionTimeToComplete,
  );
  const actionTime = operation.getActionTime(bladeburner, Player);

  const actionData = Operations[operation.name];
  if (actionData === undefined) {
    throw new Error(`Cannot find data for ${operation.name}`);
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
        <>
          <Typography>
            <CopyableText value={operation.name} /> (IN PROGRESS - {formatNumberNoSuffix(computedActionTimeCurrent, 0)}{" "}
            / {formatNumberNoSuffix(bladeburner.actionTimeToComplete, 0)})
          </Typography>
          <Typography>
            {createProgressBarText({
              progress: computedActionTimeCurrent / bladeburner.actionTimeToComplete,
            })}
          </Typography>
        </>
      ) : (
        <>
          <CopyableText value={operation.name} />
          <StartButton
            bladeburner={bladeburner}
            actionId={{ type: BladeActionType.operation, name: operation.name }}
            rerender={rerender}
          />
          <TeamSizeButton action={operation} bladeburner={bladeburner} />
        </>
      )}
      <br />
      <br />

      <ActionLevel action={operation} bladeburner={bladeburner} isActive={isActive} rerender={rerender} />
      <br />
      <br />
      <Typography>
        {actionData.desc}
        <br />
        <br />
        <SuccessChance action={operation} bladeburner={bladeburner} />
        <br />
        Time Required: {convertTimeMsToTimeElapsedString(actionTime * 1000)}
        <br />
        Operations remaining: {formatBigNumber(Math.floor(operation.count))}
        <br />
        Successes: {formatBigNumber(operation.successes)}
        <br />
        Failures: {formatBigNumber(operation.failures)}
      </Typography>
      <br />
      <Autolevel rerender={rerender} action={operation} />
    </Paper>
  );
}
