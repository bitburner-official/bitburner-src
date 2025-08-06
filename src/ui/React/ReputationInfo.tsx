import React from "react";
import { MathJax } from "better-react-mathjax";

import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { addRepToFavor } from "../../Faction/formulas/favor";
import { Favor } from "../../ui/React/Favor";
import { Reputation } from "./Reputation";

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
          <MathJax>{"\\(\\huge{r = \\text{total faction reputation}}\\)"}</MathJax>
          <MathJax>{"\\(\\huge{favor=\\log_{1.02}\\left(1+\\frac{r}{25000}\\right)}\\)"}</MathJax>
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
