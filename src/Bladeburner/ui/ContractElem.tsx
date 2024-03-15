import React from "react";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Contracts } from "../data/Contracts";
import { Bladeburner } from "../Bladeburner";
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
import { Contract } from "../Contract";
import { BladeActionType } from "../Enums";
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

  const actionData = Contracts[action.name];
  if (actionData === undefined) {
    throw new Error(`Cannot find data for ${action.name}`);
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
        <>
          <Typography>
            <CopyableText value={action.name} /> (IN PROGRESS - {formatNumberNoSuffix(computedActionTimeCurrent, 0)} /{" "}
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
          <StartButton
            bladeburner={bladeburner}
            actionId={{ type: BladeActionType.contract, name: action.name }}
            rerender={rerender}
          />
        </>
      )}
      <br />
      <br />
      <ActionLevel action={action} bladeburner={bladeburner} isActive={isActive} rerender={rerender} />
      <br />
      <br />
      <Typography>
        {actionData.desc}
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
