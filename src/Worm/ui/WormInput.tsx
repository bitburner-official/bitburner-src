import React, { useRef, useState } from "react";
import { Button, Divider, List, MenuItem, Select, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { NumberInput } from "../../ui/React/NumberInput";
import {
  applyWormSessionReward,
  finishedWormUISessions,
  getWormUISession,
  isWormOnSolveCooldown,
  pushToFinishedSessions,
  resetWormUISession,
} from "../WormSession";
import { WormGuess } from "../Graph";
import { WormPreviousSessionDisplay } from "./WormHistory";
import { makeStyles } from "@mui/styles";
import { formatNumber } from "../../ui/formatNumber";
import { MathJax } from "better-react-mathjax";

const inputStyles = makeStyles((theme: Theme) => ({
  container: {
    height: "calc(100vh - 100px)",
    display: "flex",
    flexDirection: "column",
  },
  solving: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "& > :not(:last-of-type)": {
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(1),
      alignItems: "center",
    },
  },
  history: {
    flex: "1 1 auto",
    overflowY: "scroll",
    height: "auto",
    width: "100%",
  },
  list: {
    display: "flex",
    flexDirection: "column-reverse",
  },
  paramsText: {
    color: theme.palette.info.main,
  },
  testsText: {
    color: theme.palette.warning.main,
  },
  cricticalInfoText: {
    color: theme.palette.info.light,
  },
}));

export function WormInput() {
  const classes = inputStyles();

  const [input, setInput] = useState("");
  const [state, setState] = useState("");
  const [reward, setReward] = useState("");
  const guess = useRef<WormGuess>({
    bipartite: false,
    path: "",
    value: -1,
    indegree: -1,
    dfsState: getWormUISession().graph.states[0],
  });

  function handleTest() {
    const session = getWormUISession();
    const result = session.evaluate(input, true);
    setState(result);
  }

  function handleSolve() {
    const session = getWormUISession();
    session.guess = { ...session.guess, ...guess.current };

    const sessionReward = session.solve();
    applyWormSessionReward(sessionReward);
    setReward(formatNumber(sessionReward));

    pushToFinishedSessions(session, true);
    resetWormUISession();
  }

  return (
    <div className={classes.container}>
      <Typography variant="h5">Session Information</Typography>
      <Typography className={classes.cricticalInfoText}>
        Valid Symbols: "{getWormUISession().graph.symbols.join("")}"
      </Typography>
      <Typography className={classes.cricticalInfoText}>
        States: {getWormUISession().graph.states.at(0)} - {getWormUISession().graph.states.at(-1)}
      </Typography>
      <Typography className={classes.paramsText}>
        Chosen state for "node value": {getWormUISession().params.value}
      </Typography>
      <Typography className={classes.paramsText}>
        Chosen state for "node indegree": {getWormUISession().params.indegree}
      </Typography>
      <Typography className={classes.paramsText}>
        Chosen index for "DFS-Enumeration": {getWormUISession().params.dfsOrder}
      </Typography>
      <Typography className={classes.testsText}>Inputs tested: {getWormUISession().testsDone}</Typography>
      <Tooltip
        title={
          <>
            <Typography>Formula:</Typography>
            <MathJax>
              {"\\(\\huge{P = \\left(\\text{# of Symbols}\\right) * \\left(\\text{# of States}\\right)}\\)"}
            </MathJax>
            <MathJax>{"\\(\\huge{R = \\max{\\left(0.2, 1.01 - 0.01e^{\\frac{4.4}{P}x}\\right)}}\\)"}</MathJax>
          </>
        }
      >
        <Typography className={classes.testsText}>
          Maximum reward possible: {formatNumber(getWormUISession().getMaximumReward())}
        </Typography>
      </Tooltip>
      <br />
      <Typography>Testing input</Typography>
      <Stack direction="row" component="div" sx={{ alignItems: "center" }}>
        <TextField
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onSubmit={handleTest}
          sx={{ mr: 1 }}
        />
        <Button onClick={handleTest} sx={{ mr: 1 }}>
          Submit
        </Button>
        {state !== "" && <Typography>Result: {state}</Typography>}
      </Stack>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="h5">Propeties Input</Typography>
      <div className={classes.solving}>
        <Stack direction="row">
          <Switch onChange={(event) => (guess.current.bipartite = event.target.checked)} />
          <Typography>Bipartite</Typography>
        </Stack>
        <Stack direction="row">
          <TextField
            onChange={(event) => (guess.current.path = event.target.value)}
            sx={{ mr: 1 }}
            placeholder="ABCD"
          />
          <Typography>Shortest Path</Typography>
        </Stack>
        <Stack direction="row">
          <NumberInput onChange={(value) => (guess.current.value = value)} sx={{ mr: 1 }} placeholder="0" />
          <Typography>Node Value</Typography>
        </Stack>
        <Stack direction="row">
          <NumberInput onChange={(indegree) => (guess.current.indegree = indegree)} sx={{ mr: 1 }} placeholder="0" />
          <Typography>Node Indegree</Typography>
        </Stack>
        <Stack direction="row">
          <Select<number>
            onChange={(event) =>
              (guess.current.dfsState = getWormUISession().graph.states[event.target.value as number])
            }
            defaultValue={0}
            sx={{ mr: 1, minWidth: 200 }}
          >
            {getWormUISession().graph.states.map((state, index) => (
              <MenuItem key={state} value={index}>
                {state}
              </MenuItem>
            ))}
          </Select>
          <Typography>Depth-First-Search State</Typography>
        </Stack>
        <Stack direction="row">
          <Button disabled={isWormOnSolveCooldown()} onClick={handleSolve}>
            Solve
          </Button>
          {reward !== "" && <Typography sx={{ ml: 1.5 }}>Reward: {reward}</Typography>}
        </Stack>
      </div>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="h5">Previous sessions</Typography>
      <div className={classes.history}>
        <List dense className={classes.list}>
          {finishedWormUISessions.length === 0 && (
            <Typography>You have not finished any Worm sessions manually...</Typography>
          )}
          {finishedWormUISessions.map((session) => (
            <WormPreviousSessionDisplay key={session.startTime + "-" + session.finishTime ?? "DNF"} session={session} />
          ))}
        </List>
      </div>
    </div>
  );
}
