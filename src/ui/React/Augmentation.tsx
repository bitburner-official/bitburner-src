import * as React from "react";
import { Box } from "@mui/material";

export function Augmentation({ name }: { name: string }): JSX.Element {
  return (
    <Box component="span" sx={{ color: (theme) => theme.colors.combat }}>
      {name}
    </Box>
  );
}
