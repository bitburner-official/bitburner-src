import React from "react";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Favor } from "../../ui/React/Favor";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { MathNotationOutput } from "../../Documentation/ui/MathNotationOutput";

export function FavorInfo({ favor, boldLabel }: { favor: number; boldLabel?: boolean }): React.ReactElement {
  return (
    <Tooltip
      title={
        <>
          <Typography>
            Faction favor increases the rate at which you earn reputation for this faction by 1% per favor. Faction
            favor is gained whenever you install an Augmentation. The amount of favor you gain depends on the total
            amount of reputation you earned with this faction across all resets.
          </Typography>
          <Typography style={{ fontSize: "2rem" }}>r = Reputation gain</Typography>
          <MathNotationOutput notation={MathNotation.FavorBonus} />
        </>
      }
    >
      <Typography component="div" sx={{ display: "flex", alignItems: "center", whiteSpace: "pre-wrap" }}>
        <Typography sx={{ fontWeight: `${boldLabel ? "bold" : "normal"}` }}>Favor: </Typography>
        <Favor favor={favor} />
        <InfoIcon sx={{ fontSize: "1.1em", marginLeft: "10px" }} />
      </Typography>
    </Tooltip>
  );
}
