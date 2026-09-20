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
  startOpen: boolean;
}

export function ServerAccordion({ server, scripts, startOpen }: ServerAccordionProps): React.ReactElement {
  const [open, setOpen] = React.useState(startOpen);

  // Accordion's header text
  const longestHostnameLength = 26;
  // Use spread operator to get accurate length on servers with UTF-16 names
  const hostnameChars = [...server.hostname];
  const paddedName =
    hostnameChars.length > longestHostnameLength
      ? hostnameChars.slice(0, longestHostnameLength - 3).join("") + "..."
      : server.hostname + " ".repeat(longestHostnameLength - hostnameChars.length);
  const barOptions = {
    progress: server.ramUsed / server.maxRam,
    totalTicks: 30,
  };
  const headerTxt = `${paddedName} ${createProgressBarText(barOptions)}`;

  return (
    <Paper>
      <ListItemButton onClick={() => setOpen((old) => !old)}>
        <ListItemText primary={<Typography style={{ whiteSpace: "pre-wrap" }}>{headerTxt}</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Box mx={2}>
        <Collapse in={open} timeout={0} unmountOnExit>
          <ServerAccordionContent scripts={scripts} />
        </Collapse>
      </Box>
    </Paper>
  );
}
