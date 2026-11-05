import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
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
import { ConnectLink } from "./ConnectLink";

const preformattedTypographySx = {
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  m: 0,
  width: "100%",
};

export function TerminalRoot(): React.ReactElement {
  const scrollHook = useRef<HTMLUListElement>(null);
  const rerender = useRerender();
  const [key, setKey] = useState(0);

  useEffect(() => {
    const debounced = _.debounce(() => rerender(), 25, { maxWait: 50 });
    const unsubscribe = TerminalEvents.subscribe(debounced);
    return () => {
      debounced.cancel();
      unsubscribe();
    };
  }, [rerender]);

  useEffect(() => {
    const clear = () => setKey((key) => key + 1);
    const debounced = _.debounce(() => clear(), 25, { maxWait: 50 });
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

  return (
    <Box component="div" sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 16px)" }}>
      <Box
        component="ul"
        key={key}
        id="terminal"
        sx={{ padding: 0, overflow: "scroll", flex: "0 1 auto", margin: "auto 0 0" }}
        ref={scrollHook}
      >
        {Terminal.outputHistory.map((item, i) => (
          <Box component="li" key={i}>
            {item instanceof Output && <ANSIITypography text={item.text} color={item.color} />}
            {item instanceof RawOutput && (
              <Typography component="div" sx={preformattedTypographySx} paragraph={false}>
                {item.raw}
              </Typography>
            )}
            {item instanceof Link && (
              <Typography component="div" sx={preformattedTypographySx}>
                {item.dashes}
                <ConnectLink path={item.path} text={item.text} />
              </Typography>
            )}
          </Box>
        ))}

        {Terminal.action !== null && (
          <Box component="li">
            <TerminalActionTimer />{" "}
          </Box>
        )}
      </Box>
      <TerminalInput />
      <BitFlumeModal />
      <CodingContractModal />
    </Box>
  );
}
