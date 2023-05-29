import React, { useEffect } from "react";
import _ from "lodash";
import Typography from "@mui/material/Typography";

import { useRerender } from "../../ui/React/hooks";
import { Terminal } from "../../Terminal";
import { TerminalProcessEvents } from "../TerminalEvents";

export function TerminalActionTimer(): React.ReactElement {
  const rerender = useRerender();

  useEffect(() => {
    const debounced = _.debounce(rerender, 25, { maxWait: 50 });
    const unsubscribe = TerminalProcessEvents.subscribe(debounced);
    return () => {
      debounced.cancel();
      unsubscribe();
    };
  }, []);

  return (
    <Typography color="primary" paragraph={false}>
      {Terminal.getProgressText()}
    </Typography>
  );
}
