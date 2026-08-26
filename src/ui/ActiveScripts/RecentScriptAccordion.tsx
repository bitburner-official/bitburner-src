/**
 * React Component for displaying a single WorkerScript's info as an
 * Accordion element
 */
import * as React from "react";

import { formatExp, formatThreads } from "../formatNumber";

import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { makeStyles } from "tss-react/mui";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { arrayToString } from "../../utils/helpers/ArrayHelpers";
import { Money } from "../React/Money";
import { MoneyRate } from "../React/MoneyRate";
import { RecentScript } from "../../Netscript/RecentScripts";
import { LogBoxEvents } from "../React/LogBoxManager";

const useStyles = makeStyles()({
  noborder: {
    borderBottom: "none",
  },
});

interface IProps {
  recentScript: RecentScript;
}

export function RecentScriptAccordion(props: IProps): React.ReactElement {
  const { classes } = useStyles();
  const [open, setOpen] = React.useState(false);
  const recentScript = props.recentScript;

  // Calculations for script stats
  const onlineMps = recentScript.runningScript.onlineMoneyMade / recentScript.runningScript.onlineRunningTime;
  const onlineEps = recentScript.runningScript.onlineExpGained / recentScript.runningScript.onlineRunningTime;

  function logClickHandler(): void {
    LogBoxEvents.emit(recentScript.runningScript);
  }
  return (
    <>
      <ListItemButton onClick={() => setOpen((old) => !old)} component={Paper}>
        <ListItemText
          primary={
            <Typography>
              └ {recentScript.runningScript.filename}
              （已于{" "}
              {convertTimeMsToTimeElapsedString(new Date().getTime() - recentScript.timeOfDeath.getTime())} 前终止）
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
                <TableCell className={classes.noborder}>
                  <Typography>└ 线程：</Typography>
                </TableCell>
                <TableCell className={classes.noborder}>
                  <Typography>{formatThreads(recentScript.runningScript.threads)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder} colSpan={2}>
                  <Typography sx={{ overflowWrap: "anywhere" }}>
                    └ 参数：{arrayToString(recentScript.runningScript.args)}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ 在线时间：</Typography>
                </TableCell>
                <TableCell className={classes.noborder}>
                  <Typography>
                    {convertTimeMsToTimeElapsedString(recentScript.runningScript.onlineRunningTime * 1e3)}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ 离线时间：</Typography>
                </TableCell>
                <TableCell className={classes.noborder}>
                  <Typography>
                    {convertTimeMsToTimeElapsedString(recentScript.runningScript.offlineRunningTime * 1e3)}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ 在线总收益：</Typography>
                </TableCell>
                <TableCell className={classes.noborder} align="left">
                  <Typography>
                    <Money money={recentScript.runningScript.onlineMoneyMade} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder} colSpan={1} />
                <TableCell className={classes.noborder} align="left">
                  <Typography>
                    &nbsp;{formatExp(recentScript.runningScript.onlineExpGained) + " 黑客经验"}
                  </Typography>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ 在线产出速率：</Typography>
                </TableCell>
                <TableCell className={classes.noborder} align="left">
                  <Typography>
                    <MoneyRate money={onlineMps} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder} colSpan={1} />
                <TableCell className={classes.noborder} align="left">
                  <Typography>&nbsp;{formatExp(onlineEps) + " 黑客经验/秒"}</Typography>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className={classes.noborder}>
                  <Typography>└ 离线总收益：</Typography>
                </TableCell>
                <TableCell className={classes.noborder} align="left">
                  <Typography>
                    <Money money={recentScript.runningScript.offlineMoneyMade} />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noborder} colSpan={1} />
                <TableCell className={classes.noborder} align="left">
                  <Typography>
                    &nbsp;{formatExp(recentScript.runningScript.offlineExpGained) + " 黑客经验"}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Button onClick={logClickHandler}>日志</Button>
        </Box>
      </Collapse>
    </>
  );
}
