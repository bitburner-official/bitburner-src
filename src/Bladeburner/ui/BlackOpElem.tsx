import type { Bladeburner } from "../Bladeburner";
import type { BlackOperation } from "../Actions/BlackOperation";

import React from "react";
import { Paper, Typography } from "@mui/material";

import { Player } from "@player";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { TeamSizeButton } from "./TeamSizeButton";
import { CopyableText } from "../../ui/React/CopyableText";
import { SuccessChance } from "./SuccessChance";
import { StartButton } from "./StartButton";
import { useRerender } from "../../ui/React/hooks";

interface BlackOpElemProps {
  bladeburner: Bladeburner;
  blackOp: BlackOperation;
}

export function BlackOpElem({ bladeburner, blackOp }: BlackOpElemProps): React.ReactElement {
  const rerender = useRerender();
  const isCompleted = bladeburner.numBlackOpsComplete > blackOp.n;
  if (isCompleted) {
    return (
      <Paper sx={{ my: 1, p: 1 }}>
        <Typography>{blackOp.name} (COMPLETED)</Typography>
      </Paper>
    );
  }

  const isActive = bladeburner.action?.name === blackOp.name;
  const actionTime = blackOp.getActionTime(bladeburner, Player);
  const hasReqdRank = bladeburner.rank >= blackOp.reqdRank;
  const computedActionTimeCurrent = Math.min(
    bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow,
    bladeburner.actionTimeToComplete,
  );

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      {isActive ? (
        <>
          <CopyableText value={blackOp.name} />
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
          <CopyableText value={blackOp.name} />

          <StartButton bladeburner={bladeburner} action={blackOp} rerender={rerender} />
          <TeamSizeButton action={blackOp} bladeburner={bladeburner} />
        </>
      )}

      <br />
      <br />
      <Typography whiteSpace={"pre-wrap"}>{blackOp.desc}</Typography>
      <br />
      <br />
      <Typography color={hasReqdRank ? "primary" : "error"}>
        Required Rank: {formatNumberNoSuffix(blackOp.reqdRank, 0)}
      </Typography>
      <br />
      <Typography>
        <SuccessChance action={blackOp} bladeburner={bladeburner} />
        <br />
        Time Required: {convertTimeMsToTimeElapsedString(actionTime * 1000)}
      </Typography>
    </Paper>
  );
}
