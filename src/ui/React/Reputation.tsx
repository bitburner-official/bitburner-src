import * as React from "react";
import { formatReputation } from "../formatNumber";
import { Typography } from "@mui/material";

export function Reputation({ reputation }: { reputation: number | string }): React.ReactElement {
  return (
    <Typography component="span" sx={{ color: (theme) => theme.colors.rep }}>
      {typeof reputation === "number" ? formatReputation(reputation) : reputation}
    </Typography>
  );
}
