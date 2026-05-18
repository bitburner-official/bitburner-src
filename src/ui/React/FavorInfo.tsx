import React from "react";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { addRepToFavor } from "../../Faction/formulas/favor";
import { Favor } from "../../ui/React/Favor";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { MathNotationOutput } from "../../Documentation/ui/MathNotationOutput";

export function FavorInfo({
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
            Faction favor increases the rate at which you earn reputation for this faction. The reputation gain is
            increased by a factor of{" "}
            <MathNotationOutput notation={MathNotation.FavorBonusFactor} sx={{ display: "inline-block" }} />, which
            means a 1% increase per favor, stacking additively.
          </Typography>

          <Typography>
            Faction favor is gained whenever you install Augmentations. The amount of favor you gain depends on the
            total amount of reputation you earned with this faction across all resets. If you install Augmentations now,
            you will have <Favor favor={addRepToFavor(favor, playerReputation)} /> favor with this faction.
          </Typography>

          <MathNotationOutput
            notation={MathNotation.RepToFavor}
            sx={{ display: "flex", justifyContent: "center", paddingTop: "10px" }}
          />
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
