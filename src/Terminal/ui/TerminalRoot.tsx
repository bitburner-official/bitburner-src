import React, { useState, useEffect, useRef } from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Link as MuiLink } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import Box from "@mui/material/Box";
import { Output, Link, RawOutput } from "../OutputTypes";
import { Terminal } from "../../Terminal";
import { TerminalInput } from "./TerminalInput";
import { TerminalEvents, TerminalClearEvents } from "../TerminalEvents";
import { BitFlumeModal } from "../../BitNode/ui/BitFlumeModal";
import { CodingContractModal } from "../../ui/React/CodingContractModal";

import _ from "lodash";
import { ANSIITypography } from "../../ui/React/ANSIITypography";
import { useRerender } from "../../ui/React/hooks";

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
    },
    list: {
      padding: theme.spacing(0),
      height: "100%",
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
                <>
                  <Typography>{item.dashes}&gt;&nbsp;</Typography>
                  <MuiLink
                    classes={{ root: classes.preformatted }}
                    color={"secondary"}
                    paragraph={false}
                    onClick={() => Terminal.connectToServer(item.hostname)}
                  >
                    <Typography sx={{ textDecoration: "underline", "&:hover": { textDecoration: "none" } }}>
                      {item.hostname}
                    </Typography>
                  </MuiLink>
                </>
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
