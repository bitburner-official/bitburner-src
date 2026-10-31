/**
 * React Component for displaying a single WorkerScript's info as an
 * Accordion element
 */
import * as React from "react";

import { formatExp, formatThreads, formatRam } from "../formatNumber";

import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { WorkerScript } from "../../Netscript/WorkerScript";

import { dialogBoxCreate } from "../React/DialogBox";
import { LogBoxEvents } from "../React/LogBoxManager";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { arrayToString } from "../../utils/helpers/ArrayHelpers";
import { Money } from "../React/Money";
import { MoneyRate } from "../React/MoneyRate";

interface IProps {
  workerScript: WorkerScript;
}

export function WorkerScriptAccordion(props: IProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const workerScript = props.workerScript;
  const scriptRef = workerScript.scriptRef;

  function logClickHandler(): void {
    LogBoxEvents.emit(scriptRef);
  }
  const killScript = killWorkerScriptByPid.bind(null, scriptRef.pid);

  function killScriptClickHandler(): void {
    if (killScript()) dialogBoxCreate("Killing script");
  }

  // Calculations for script stats
  const onlineMps = scriptRef.onlineMoneyMade / scriptRef.onlineRunningTime;
  const onlineEps = scriptRef.onlineExpGained / scriptRef.onlineRunningTime;

  return (
    <>
      <ListItemButton onClick={() => setOpen((old) => !old)} component={Paper}>
        <ListItemText
          primary={
            <Typography sx={{ overflowWrap: "break-word" }}>
              └ {props.workerScript.name} ({formatRam(scriptRef.ramUsage * scriptRef.threads)}){" "}
              {JSON.stringify(scriptRef.args)}
            </Typography>
          }
        />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Collapse in={open} timeout={0} unmountOnExit>
        <Box mx={6}>
          <Table padding="none" size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>└ Threads:</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>
                    {formatThreads(scriptRef.threads)} {`(${formatRam(scriptRef.ramUsage)} each)`}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }} colSpan={2}>
                  <Typography sx={{ overflowWrap: "anywhere" }}>└ Args: {arrayToString(scriptRef.args)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>└ Online Time:</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>{convertTimeMsToTimeElapsedString(scriptRef.onlineRunningTime * 1e3)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>└ Offline Time:</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>{convertTimeMsToTimeElapsedString(scriptRef.offlineRunningTime * 1e3)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>└ Total online production:</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }} align="left">
                  <Typography>
                    <Money money={scriptRef.onlineMoneyMade} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }} colSpan={1} />
                <TableCell sx={{ borderBottom: "none" }} align="left">
                  <Typography>&nbsp;{formatExp(scriptRef.onlineExpGained) + " hacking exp"}</Typography>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>└ Online production rate:</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }} align="left">
                  <Typography>
                    <MoneyRate money={onlineMps} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }} colSpan={1} />
                <TableCell sx={{ borderBottom: "none" }} align="left">
                  <Typography>&nbsp;{formatExp(onlineEps) + " hacking exp / sec"}</Typography>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Typography>└ Total offline production:</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }} align="left">
                  <Typography>
                    <Money money={scriptRef.offlineMoneyMade} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: "none" }} colSpan={1} />
                <TableCell sx={{ borderBottom: "none" }} align="left">
                  <Typography>&nbsp;{formatExp(scriptRef.offlineExpGained) + " hacking exp"}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Button onClick={logClickHandler}>LOG</Button>
          <IconButton onClick={killScriptClickHandler}>
            <DeleteIcon color="error" />
          </IconButton>
        </Box>
      </Collapse>
    </>
  );
}
