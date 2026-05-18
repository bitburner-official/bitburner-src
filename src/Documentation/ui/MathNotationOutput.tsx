import React from "react";
import Typography from "@mui/material/Typography";
import { convertMathNotation } from "../root";
import type { SxProps, Theme } from "@mui/system";

export function MathNotationOutput({ notation, sx }: { notation: string; sx?: SxProps<Theme> }): JSX.Element {
  // It's fine to use dangerouslySetInnerHTML here. We control the data in both MathNotation.json and
  // MathNotationOutput.json. They are not user-provided data.
  return <Typography dangerouslySetInnerHTML={{ __html: convertMathNotation(notation) }} sx={sx} />;
}
