import type { Bladeburner } from "../Bladeburner";
import type { Contract } from "../Actions/Contract";

import React from "react";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Player } from "@player";
import { SuccessChance } from "./SuccessChance";
import { ActionLevel } from "./ActionLevel";
import { Autolevel } from "./Autolevel";
import { formatBigNumber } from "../../ui/formatNumber";
import { Paper, Typography } from "@mui/material";
import { useRerender } from "../../ui/React/hooks";
import { ActionHeader } from "./ActionHeader";

interface ContractElemProps {
  bladeburner: Bladeburner;
  action: Contract;
}

export function ContractElem({ bladeburner, action }: ContractElemProps): React.ReactElement {
  const rerender = useRerender();
  const isActive = action.name === bladeburner.action?.name;
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
        Contracts remaining: {formatBigNumber(Math.floor(action.count))}
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
