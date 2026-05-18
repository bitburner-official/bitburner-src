import React from "react";

import Typography from "@mui/material/Typography";

import { Reputation } from "./Reputation";

export function ReputationInfo({
  playerReputation,
  boldLabel,
}: {
  playerReputation: number;
  boldLabel?: boolean;
}): React.ReactElement {
  return (
    <Typography component="div" sx={{ display: "flex", alignItems: "center", whiteSpace: "pre-wrap" }}>
      <Typography sx={{ fontWeight: `${boldLabel ? "bold" : "normal"}` }}>Reputation: </Typography>
      <Reputation reputation={playerReputation} />
    </Typography>
  );
}
