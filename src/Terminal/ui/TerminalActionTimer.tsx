import React from "react";
import Typography from "@mui/material/Typography";

import { useCycleRerender } from "../../ui/React/hooks";
import { Terminal } from "../../Terminal";

export function TerminalActionTimer(): React.ReactElement {
  useCycleRerender();

  return <Typography color="primary">{Terminal.action && Terminal.getProgressText()}</Typography>;
}
