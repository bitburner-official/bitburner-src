import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import { useRerender } from "../../ui/React/hooks";
import { WormSessionEvents } from "../WormEvents";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { WormSession, currentWormSessions, finishedWormSessions } from "../WormSession";
import { formatNumber } from "../../ui/formatNumber";

const historyStyles = makeStyles({
  container: {
    height: "calc(100vh - 100px)",
    overflowY: "hidden",
  },
  listContainer: {
    height: "calc(40vh - 50px)",
    overflowY: "scroll",
  },
  list: {
    display: "flex",
    flexDirection: "column-reverse",
  },
});

export function WormHistory() {
  const rerender = useRerender();
  const classes = historyStyles();

  useEffect(() => WormSessionEvents.subscribe(() => rerender()));

  return (
    <div className={classes.container}>
      <Typography variant="h5">Worm history</Typography>
      <Typography>
        Here you can see all of the ongoing and finished worm sessions of your scripts. Sessions don't persist while you
        are offline.
      </Typography>
      <br />
      <br />
      <Typography variant="h5">Current Sessions</Typography>
      <div className={classes.listContainer}>
        <List dense className={classes.list}>
          {currentWormSessions.size === Number(currentWormSessions.has(-1)) && (
            <Typography>There are no ongoing Worm sessions at the moment. Start one using the Worm API!</Typography>
          )}
          {Array.from(currentWormSessions.values()).map((session) => (
            <WormSessionDisplay key={session.identifier + " " + session.startTime} session={session} />
          ))}
        </List>
      </div>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="h5">Finished Sessions</Typography>
      <div className={classes.listContainer}>
        <List dense className={classes.list}>
          {finishedWormSessions.filter((session) => session.identifier !== -1).length === 0 && (
            <Typography>No Worm sessions have been completed yet.</Typography>
          )}
          {finishedWormSessions
            .filter((session) => session.identifier !== -1)
            .map((session) => (
              <WormPreviousSessionDisplay key={session.identifier + " " + session.startTime} session={session} />
            ))}
        </List>
      </div>
    </div>
  );
}

const useStyles = makeStyles({
  noBorder: {
    borderBottom: "none",
  },
});

export function WormSessionDisplay({ session }: { session: WormSession }) {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  return (
    <Box component={Paper}>
      <ListItemButton onClick={() => setOpen((old) => !old)}>
        <ListItemText
          primary={
            <Typography style={{ whiteSpace: "pre-wrap" }}>
              #{session.identifier} - {convertTimeMsToTimeElapsedString(Date.now() - session.startTime)} elapsed
            </Typography>
          }
        />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Box mx={2} pb={1}>
        <Collapse in={open} timeout={0} unmountOnExit>
          <Table padding="none" size="small">
            <TableBody>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Time elapsed:</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{convertTimeMsToTimeElapsedString(Date.now() - session.startTime)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Amount of states:</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.states.length}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Alphabet:</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.symbols.join(", ")}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Tests done:</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.testsDone}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Current guess:</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder} />
                <TableCell className={classes.noBorder}>
                  <Typography>Shortest Input</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Bipartite</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Node Value</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Node Indegree</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Depth First Search State</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder} />
                <TableCell className={classes.noBorder}>
                  <Typography>"{session.guess.path}"</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.guess.bipartite ? "true" : "false"}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.guess.value}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.guess.indegree}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.guess.dfsState || "None"}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Collapse>
      </Box>
    </Box>
  );
}

export function WormPreviousSessionDisplay({ session }: { session: WormSession }) {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  return (
    <Box component={Paper}>
      <ListItemButton onClick={() => setOpen((old) => !old)}>
        <ListItemText
          primary={
            <Typography>
              #{session.identifier} -{" "}
              {convertTimeMsToTimeElapsedString(Date.now() - (session.finishTime || session.startTime))} ago
            </Typography>
          }
        />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Box mx={2} pb={1}>
        <Collapse in={open} timeout={0} unmountOnExit>
          <Table padding="none" size="small">
            <TableBody>
              {session.finishTime && (
                <TableRow>
                  <TableCell className={classes.noBorder}>
                    <Typography>└ Time spent:</Typography>
                  </TableCell>
                  <TableCell className={classes.noBorder}>
                    <Typography>{convertTimeMsToTimeElapsedString(session.finishTime - session.startTime)}</Typography>
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Amount of states:</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.states.length}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Alphabet:</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.symbols.join(", ")}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Tests done:</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.testsDone}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Final guess:</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder} />
                <TableCell className={classes.noBorder}>
                  <Typography>Shortest Input</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Bipartite</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Node Value</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Node Indegree</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Depth First Search State</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder} />
                <TableCell className={classes.noBorder}>
                  <Typography>"{session.guess.path}"</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.guess.bipartite ? "true" : "false"}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.guess.value}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.guess.indegree}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.guess.dfsState || "None"}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Correct properties:</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder} />
                <TableCell className={classes.noBorder}>
                  <Typography>Shortest Input</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Bipartite</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Node Value</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Node Indegree</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>Depth First Search State</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder} />
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.properties.pathLength}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.properties.bipartite ? "true" : "false"}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.properties.values[session.params.value]}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.properties.indegrees[session.params.indegree]}</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{session.graph.properties.dfsOrder[session.params.dfsOrder] || "None"}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.noBorder}>
                  <Typography>└ Reward:</Typography>
                </TableCell>
                <TableCell className={classes.noBorder}>
                  <Typography>{formatNumber(session.getReward())}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Collapse>
      </Box>
    </Box>
  );
}
