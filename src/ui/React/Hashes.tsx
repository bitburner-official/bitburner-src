import * as React from "react";
import { formatHashes } from "../formatNumber";
import { Box } from "@mui/material";

export function Hashes({ hashes }: { hashes: number | string }): React.ReactElement {
  return (
    <Box sx={{ color: (theme) => theme.colors.money }}>
      {typeof hashes === "number" ? formatHashes(hashes) : hashes}
    </Box>
  );
}
