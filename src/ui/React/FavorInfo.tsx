import React from "react";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Favor } from "../../ui/React/Favor";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { convertMathNotation } from "../../Documentation/root";

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
          <Typography>
            {/* It's fine to use dangerouslySetInnerHTML here. We control the data in both MathNotation.json and
            MathNotationOutput.json. They are not user-provided data. */}
            <span dangerouslySetInnerHTML={{ __html: convertMathNotation(MathNotation.FavorBonus) }} />
          </Typography>
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
