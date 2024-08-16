import type { Bladeburner } from "../Bladeburner";
import type { Operation } from "../Actions/Operation";

import React from "react";
import { Paper, Typography } from "@mui/material";

import { Player } from "@player";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { SuccessChance } from "./SuccessChance";
import { ActionLevel } from "./ActionLevel";
import { Autolevel } from "./Autolevel";
import { formatBigNumber } from "../../ui/formatNumber";
import { useRerender } from "../../ui/React/hooks";
import { BladeActionType } from "@enums";
import { ActionHeader } from "./ActionHeader";

interface OperationElemProps {
  bladeburner: Bladeburner;
  action: Operation;
}

export function OperationElem({ bladeburner, action }: OperationElemProps): React.ReactElement {
  const rerender = useRerender();
  const isActive = bladeburner.action?.type === BladeActionType.operation && action.name === bladeburner.action?.name;
  const actionTime = action.getActionTime(bladeburner, Player);

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <ActionHeader bladeburner={bladeburner} action={action} rerender={rerender}></ActionHeader>
      <br />
      <ActionLevel action={action} bladeburner={bladeburner} isActive={isActive} rerender={rerender} />
      <br />
      <Typography whiteSpace={"pre-wrap"}>
        {action.desc}
        <br />
        <br />
        <SuccessChance action={action} bladeburner={bladeburner} />
        <br />
        Time Required: {convertTimeMsToTimeElapsedString(actionTime * 1000)}
        <br />
        Operations remaining: {formatBigNumber(Math.floor(action.count))}
        <br />
        Successes: {formatBigNumber(action.successes)}
        <br />
        Failures: {formatBigNumber(action.failures)}
      </Typography>
      <br />
      <Autolevel rerender={rerender} action={action} />
    </Paper>
  );
}
