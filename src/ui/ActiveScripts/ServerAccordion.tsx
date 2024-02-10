/**
 * React Component for rendering the Accordion element for a single
 * server in the 'Active Scripts' UI page
 */
import * as React from "react";

import Typography from "@mui/material/Typography";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { ServerAccordionContent } from "./ServerAccordionContent";

import { WorkerScript } from "../../Netscript/WorkerScript";

import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { GetServer } from "../../Server/AllServers";

interface ServerAccordionProps {
  hostname: string;
  scripts: WorkerScript[];
}

export function ServerAccordion({ hostname, scripts }: ServerAccordionProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const server = GetServer(hostname);
  if (!server) {
    console.error(`Invalid server ${hostname} while displaying active scripts`);
    return <></>;
  }

  // Accordion's header text
  // TODO: calculate the longest hostname length rather than hard coding it
  const longestHostnameLength = 18;
  const paddedName = `${hostname}${" ".repeat(longestHostnameLength)}`.slice(
    0,
    Math.max(hostname.length, longestHostnameLength),
  );
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
