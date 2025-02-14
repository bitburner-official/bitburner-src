import type { WorkerScript } from "../../Netscript/WorkerScript";
import type { BaseServer } from "../../Server/BaseServer";

import * as React from "react";

import { Box, Collapse, ListItemText, ListItemButton, Paper, Typography } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

import { ServerAccordionContent } from "./ServerAccordionContent";

import { createProgressBarText } from "../../utils/helpers/createProgressBarText";

interface ServerAccordionProps {
  server: BaseServer;
  scripts: WorkerScript[];
  tabIndex?: number; // Ensure tabIndex is part of the props
}

export function ServerAccordion({ server, scripts, tabIndex }: ServerAccordionProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  // Accordion's header text
  const longestHostnameLength = 18;
  const paddedName = `${server.hostname}${" ".repeat(longestHostnameLength)}`.slice(
    0,
    Math.max(server.hostname.length, longestHostnameLength),
  );
  const barOptions = {
    progress: server.ramUsed / server.maxRam,
    totalTicks: 30,
  };
  const headerTxt = `${paddedName} ${createProgressBarText(barOptions)}`;

  return (
    <Paper>
      {/* Make ListItemButton focusable with tabIndex */}
      <ListItemButton onClick={() => setOpen((old) => !old)} tabIndex={tabIndex}>
        <ListItemText primary={<Typography style={{ whiteSpace: "pre-wrap" }}>{headerTxt}</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Box mx={2}>
        <Collapse in={open} timeout={0} unmountOnExit>
          {/* Pass tabIndex to ServerAccordionContent */}
          <ServerAccordionContent scripts={scripts} tabIndex={tabIndex} />
        </Collapse>
      </Box>
    </Paper>
  );
}
