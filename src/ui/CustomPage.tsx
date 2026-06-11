import Box from "@mui/material/Box";
import type { ReactElement } from "@nsdefs";
import React from "react";

export function CustomPage({ content }: { content: ReactElement }) {
  return <Box>{content}</Box>;
}
