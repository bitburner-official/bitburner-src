import type { Bladeburner } from "../Bladeburner";
import type { BlackOperation } from "../Actions/BlackOperation";

import React from "react";
import { Paper, Typography } from "@mui/material";

import { Player } from "@player";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { SuccessChance } from "./SuccessChance";
import { useRerender } from "../../ui/React/hooks";
import { ActionHeader } from "./ActionHeader";

interface BlackOpElemProps {
  bladeburner: Bladeburner;
  action: BlackOperation;
}

export function BlackOpElem({ bladeburner, action }: BlackOpElemProps): React.ReactElement {
  const rerender = useRerender();
  const isCompleted = bladeburner.numBlackOpsComplete > action.n;
  if (isCompleted) {
    return (
      <Paper sx={{ my: 1, p: 1 }}>
        <Typography>{action.name} (COMPLETED)</Typography>
      </Paper>
    );
  }

  const actionTime = action.getActionTime(bladeburner, Player);
  const hasRequiredRank = bladeburner.rank >= action.reqdRank;

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <ActionHeader bladeburner={bladeburner} action={action} rerender={rerender}></ActionHeader>
      <br />
      <Typography whiteSpace={"pre-wrap"}>{action.desc}</Typography>
      <br />
      <Typography color={hasRequiredRank ? "primary" : "error"}>
        Required Rank: {formatNumberNoSuffix(action.reqdRank, 0)}
      </Typography>
      <br />
      <Typography>
        <SuccessChance action={action} bladeburner={bladeburner} />
        <br />
        Time Required: {convertTimeMsToTimeElapsedString(actionTime * 1000)}
      </Typography>
    </Paper>
  );
}
