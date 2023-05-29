import React, { useEffect, useRef, useState } from "react";

import { Link as MuiLink } from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import _ from "lodash";

import { BitFlumeModal } from "../../BitNode/ui/BitFlumeModal";
import { Terminal } from "../../Terminal";
import { ANSIITypography } from "../../ui/React/ANSIITypography";
import { CodingContractModal } from "../../ui/React/CodingContractModal";
import { useRerender } from "../../ui/React/hooks";
import { Link, Output, RawOutput } from "../OutputTypes";
import { TerminalClearEvents, TerminalEvents } from "../TerminalEvents";
import { TerminalInput } from "./TerminalInput";

function ActionTimer(): React.ReactElement {
  return (
    <Typography color={"primary"} paragraph={false}>
      {Terminal.getProgressText()}
    </Typography>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nopadding: {
      padding: theme.spacing(0),
    },
    preformatted: {
      whiteSpace: "pre-wrap",
      overflowWrap: "anywhere",
      margin: theme.spacing(0),
      width: "100%",
    },
    list: {
      padding: theme.spacing(0),
      height: "100%",
      width: "100%",
    },
  }),
);

export function TerminalRoot(): React.ReactElement {
  const scrollHook = useRef<HTMLDivElement>(null);
  const rerender = useRerender();
  const [key, setKey] = useState(0);

  function clear(): void {
    setKey((key) => key + 1);
  }

  useEffect(() => {
    const debounced = _.debounce(async () => rerender(), 25, { maxWait: 50 });
    const unsubscribe = TerminalEvents.subscribe(debounced);
    return () => {
      debounced.cancel();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
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
      return window.setTimeout(() => hook.scrollIntoView(true), 50);
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

  const classes = useStyles();
  return (
    <>
      <Box width="100%" minHeight="100vh" display={"flex"} alignItems={"flex-end"}>
        <List key={key} id="terminal" classes={{ root: classes.list }}>
          {Terminal.outputHistory.map((item, i) => (
            <ListItem key={i} classes={{ root: classes.nopadding }}>
              {item instanceof Output && <ANSIITypography text={item.text} color={item.color} />}
              {item instanceof RawOutput && (
                <Typography classes={{ root: classes.preformatted }} paragraph={false}>
                  {item.raw}
                </Typography>
              )}
              {item instanceof Link && (
                <Typography>
                  {item.dashes + "> "}
                  <MuiLink onClick={() => Terminal.connectToServer(item.hostname)}>{item.hostname}</MuiLink>
                </Typography>
              )}
            </ListItem>
          ))}

          {Terminal.action !== null && (
            <ListItem classes={{ root: classes.nopadding }}>
              <ActionTimer />{" "}
            </ListItem>
          )}
        </List>
        <div ref={scrollHook}></div>
      </Box>
      <Box position="sticky" bottom={0} width="100%" px={0}>
        <TerminalInput />
      </Box>
      <BitFlumeModal />
      <CodingContractModal />
    </>
  );
}
