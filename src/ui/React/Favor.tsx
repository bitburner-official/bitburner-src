import * as React from "react";
import { formatFavor } from "../formatNumber";
import { Box } from "@mui/material";

export function Favor({ favor }: { favor: number }): React.ReactElement {
  return (
    <Box component="span" sx={{ color: (theme) => theme.colors.rep }}>
      {formatFavor(favor)}
    </Box>
  );
}
