import React from "react";
import Typography from "@mui/material/Typography";
import { convertMathNotation } from "../root";

export function MathNotationOutput({ notation }: { notation: string }): JSX.Element {
  // It's fine to use dangerouslySetInnerHTML here. We control the data in both MathNotation.json and
  // MathNotationOutput.json. They are not user-provided data.
  return <Typography dangerouslySetInnerHTML={{ __html: convertMathNotation(notation) }} />;
}
