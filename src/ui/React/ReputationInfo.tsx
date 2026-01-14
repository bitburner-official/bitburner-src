import React from "react";

import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { addRepToFavor } from "../../Faction/formulas/favor";
import { Favor } from "../../ui/React/Favor";
import { Reputation } from "./Reputation";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { convertMathNotation } from "../../Documentation/root";

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
            You will have <Favor favor={addRepToFavor(favor, playerReputation)} /> faction favor after installing an
            Augmentation.
          </Typography>
          <Typography style={{ fontSize: "2rem" }}>r = Total faction reputation</Typography>
          <Typography>
            {/* It's fine to use dangerouslySetInnerHTML here. We control the data in both MathNotation.json and
            MathNotationOutput.json. They are not user-provided data. */}
            <span dangerouslySetInnerHTML={{ __html: convertMathNotation(MathNotation.RepToFavor) }} />
          </Typography>
        </>
      }
    >
      <Typography component="div" sx={{ display: "flex", alignItems: "center", whiteSpace: "pre-wrap" }}>
        <Typography sx={{ fontWeight: `${boldLabel ? "bold" : "normal"}` }}>Reputation: </Typography>
        <Reputation reputation={playerReputation} />
        <InfoIcon sx={{ fontSize: "1.1em", marginLeft: "10px" }} />
      </Typography>
    </Tooltip>
  );
}
