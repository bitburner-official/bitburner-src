import React, { useEffect } from "react";
import Typography from "@mui/material/Typography";

import { useRerender } from "../../ui/React/hooks";
import { Terminal } from "../../Terminal";
import { TerminalProcessEvents } from "../TerminalEvents";

export function TerminalActionTimer(): React.ReactElement {
  const rerender = useRerender();

  useEffect(() => {
    const unsubscribe = TerminalProcessEvents.subscribe(rerender);
    return unsubscribe;
  }, []);

  return (
    <Typography color="primary" paragraph={false}>
      {Terminal.getProgressText()}
    </Typography>
  );
}
