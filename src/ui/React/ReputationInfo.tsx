import React from "react";

import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { addRepToFavor } from "../../Faction/formulas/favor";
import { Favor } from "../../ui/React/Favor";
import { Reputation } from "./Reputation";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { MathNotationOutput } from "../../Documentation/ui/MathNotationOutput";

export function ReputationInfo({
  favor,
  playerReputation,
  boldLabel,
}: {
  favor: number;
  playerReputation: number;
  boldLabel?: boolean;
}): React.ReactElement {
  return (
    <Tooltip
      title={
        <>
          <Typography>
            安装一个强化后，你将拥有 <Favor favor={addRepToFavor(favor, playerReputation)} /> 的派系好感。
          </Typography>
          <Typography style={{ fontSize: "2rem" }}>r = 派系总声望</Typography>
          <MathNotationOutput notation={MathNotation.RepToFavor} />
        </>
      }
    >
      <Typography component="div" sx={{ display: "flex", alignItems: "center", whiteSpace: "pre-wrap" }}>
        <Typography sx={{ fontWeight: `${boldLabel ? "bold" : "normal"}` }}>声望： </Typography>
        <Reputation reputation={playerReputation} />
        <InfoIcon sx={{ fontSize: "1.1em", marginLeft: "10px" }} />
      </Typography>
    </Tooltip>
  );
}
