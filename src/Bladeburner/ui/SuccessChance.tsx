import type { Bladeburner } from "../Bladeburner";
import type { Action } from "../Types";

import React from "react";

import { Player } from "@player";
import { formatPercent } from "../../ui/formatNumber";
import { StealthIcon } from "./StealthIcon";
import { KillIcon } from "./KillIcon";
import { Tooltip, Typography } from "@mui/material";

interface SuccessChanceProps {
  bladeburner: Bladeburner;
  action: Action;
}

export function SuccessChance({ bladeburner, action }: SuccessChanceProps): React.ReactElement {
  const [minChance, maxChance] = action.getSuccessRange(bladeburner, Player);

  const chance = formatPercent(minChance, 1) + (minChance === maxChance ? "" : ` ~ ${formatPercent(maxChance, 1)}`);

  return (
    <>
      <Tooltip title={action.successScaling ? <Typography>{action.successScaling}</Typography> : ""}>
        <span>
          Estimated success chance: {chance}
          {/* Intentional space*/}{" "}
        </span>
      </Tooltip>
      {action.isStealth ? <StealthIcon /> : <></>}
      {action.isKill ? <KillIcon /> : <></>}
    </>
  );
}
