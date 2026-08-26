import { Paper, Typography } from "@mui/material";
import React from "react";
import type { Infiltration } from "../Infiltration";
import type { BracketModel } from "../model/BracketModel";
import { BlinkingCursor } from "./BlinkingCursor";

interface IProps {
  state: Infiltration;
  stage: BracketModel;
}

export function BracketGame({ stage }: IProps): React.ReactElement {
  return (
    <>
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">闭合括号</Typography>
        <Typography style={{ fontSize: "5em" }}>
          {`${stage.left}${stage.right}`}
          <BlinkingCursor />
        </Typography>
      </Paper>
    </>
  );
}
