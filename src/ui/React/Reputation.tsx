import * as React from "react";
import { formatReputation } from "../formatNumber";
import { Box } from "@mui/material";

export function Reputation({ reputation }: { reputation: number | string }): React.ReactElement {
  return (
    <Box component="span" sx={{ color: (theme) => theme.colors.rep }}>
      {typeof reputation === "number" ? formatReputation(reputation) : reputation}
    </Box>
  );
}
