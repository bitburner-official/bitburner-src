import type { Bladeburner } from "../Bladeburner";
import type { Action } from "../Types";

import React from "react";

import { Player } from "@player";
import { formatPercent } from "../../ui/formatNumber";
import { StealthIcon } from "./StealthIcon";
import { KillIcon } from "./KillIcon";

interface SuccessChanceProps {
  bladeburner: Bladeburner;
  action: Action;
}

export function SuccessChance({ bladeburner, action }: SuccessChanceProps): React.ReactElement {
  const [minChance, maxChance] = action.getSuccessRange(bladeburner, Player);

  const chance = formatPercent(minChance, 1) + (minChance === maxChance ? "" : ` ~ ${formatPercent(maxChance, 1)}`);

  return (
    <>
      Estimated success chance: {chance} {action.isStealth ? <StealthIcon /> : <></>}
      {action.isKill ? <KillIcon /> : <></>}
    </>
  );
}
