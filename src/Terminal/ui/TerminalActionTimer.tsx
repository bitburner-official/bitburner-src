import React from "react";
import Typography from "@mui/material/Typography";

import { useRerender } from "../../ui/React/hooks";
import { Terminal } from "../../Terminal";

export function TerminalActionTimer(): React.ReactElement {
  useRerender(200);

  return <Typography color="primary">{Terminal.action && Terminal.getProgressText()}</Typography>;
}
