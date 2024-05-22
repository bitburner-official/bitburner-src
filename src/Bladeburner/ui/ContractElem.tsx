import type { Bladeburner } from "../Bladeburner";
import type { Contract } from "../Actions/Contract";

import React from "react";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Player } from "@player";
import { SuccessChance } from "./SuccessChance";
import { CopyableText } from "../../ui/React/CopyableText";
import { ActionLevel } from "./ActionLevel";
import { Autolevel } from "./Autolevel";
import { StartButton } from "./StartButton";
import { formatNumberNoSuffix, formatBigNumber } from "../../ui/formatNumber";
import { Paper, Typography } from "@mui/material";
import { useRerender } from "../../ui/React/hooks";
import { getEnumHelper } from "../../utils/EnumHelper";

interface ContractElemProps {
  bladeburner: Bladeburner;
  action: Contract;
}

export function ContractElem({ bladeburner, action }: ContractElemProps): React.ReactElement {
  const rerender = useRerender();
  // Temp special return
  if (!getEnumHelper("BladeContractName").isMember(action.name)) return <></>;
  const isActive = action.name === bladeburner.action?.name;
  const computedActionTimeCurrent = Math.min(
    bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow,
    bladeburner.actionTimeToComplete,
  );
  const actionTime = action.getActionTime(bladeburner, Player);

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
        <>
          <CopyableText value={action.name} />
          <StartButton bladeburner={bladeburner} action={action} rerender={rerender} />
        </>
      )}
      <br />
      <br />
      <ActionLevel action={action} bladeburner={bladeburner} isActive={isActive} rerender={rerender} />
      <br />
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
