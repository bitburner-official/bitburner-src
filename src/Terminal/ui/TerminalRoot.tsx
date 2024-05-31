import React, { useState, useEffect, useRef } from "react";
import { Link as MuiLink, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import _ from "lodash";

import { Output, Link, RawOutput } from "../OutputTypes";
import { Terminal } from "../../Terminal";
import { TerminalInput } from "./TerminalInput";
import { TerminalEvents, TerminalClearEvents } from "../TerminalEvents";
import { BitFlumeModal } from "../../BitNode/ui/BitFlumeModal";
import { CodingContractModal } from "../../ui/React/CodingContractModal";

import { ANSIITypography } from "../../ui/React/ANSIITypography";
import { useRerender } from "../../ui/React/hooks";
import { TerminalActionTimer } from "./TerminalActionTimer";

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 16px)",
  },
  entries: {
    padding: 0,
    overflow: "scroll",
    flex: "0 1 auto",
    margin: "auto 0 0",
  },
  preformatted: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: theme.spacing(0),
    width: "100%",
  },
}));

export function TerminalRoot(): React.ReactElement {
  const scrollHook = useRef<HTMLUListElement>(null);
  const rerender = useRerender();
  const [key, setKey] = useState(0);

  useEffect(() => {
    const debounced = _.debounce(async () => rerender(), 25, { maxWait: 50 });
    const unsubscribe = TerminalEvents.subscribe(debounced);
    return () => {
      debounced.cancel();
      unsubscribe();
    };
  }, [rerender]);

  useEffect(() => {
    const clear = () => setKey((key) => key + 1);
    const debounced = _.debounce(async () => clear(), 25, { maxWait: 50 });
    const unsubscribe = TerminalClearEvents.subscribe(debounced);
    return () => {
      debounced.cancel();
      unsubscribe();
    };
  }, []);

  function doScroll(): number | undefined {
    const hook = scrollHook.current;
    if (hook !== null) {
      return window.setTimeout(() => (hook.scrollTop = hook.scrollHeight), 50);
    }
  }

  doScroll();

  useEffect(() => {
    let scrollId: number;
    const id = setTimeout(() => {
      scrollId = doScroll() ?? 0;
    }, 50);
    return () => {
      clearTimeout(id);
      clearTimeout(scrollId);
    };
  }, []);

  const { classes } = useStyles();
  return (
    <div className={classes.container}>
      <ul key={key} id="terminal" className={classes.entries} ref={scrollHook}>
        {Terminal.outputHistory.map((item, i) => (
          <li key={i}>
            {item instanceof Output && <ANSIITypography text={item.text} color={item.color} />}
            {item instanceof RawOutput && (
              <Typography classes={{ root: classes.preformatted }} paragraph={false}>
                {item.raw}
              </Typography>
            )}
            {item instanceof Link && (
              <Typography classes={{ root: classes.preformatted }}>
                {item.dashes}
                <MuiLink onClick={() => Terminal.connectToServer(item.hostname)}>{item.hostname}</MuiLink>
              </Typography>
            )}
          </li>
        ))}

        {Terminal.action !== null && (
          <li>
            <TerminalActionTimer />{" "}
          </li>
        )}
      </ul>
      <TerminalInput />
      <BitFlumeModal />
      <CodingContractModal />
    </div>
  );
}
