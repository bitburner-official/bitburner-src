import { Paper, Typography } from "@mui/material";
import React from "react";
import type { Infiltration } from "../Infiltration";
import type { CountdownModel } from "../model/CountdownModel";

interface IProps {
  state: Infiltration;
  stage: CountdownModel;
}

export function Countdown({ stage }: IProps): React.ReactElement {
  return (
    <Paper sx={{ p: 1, textAlign: "center" }}>
      <Typography variant="h4">Get Ready!</Typography>
      <Typography variant="h4">{stage.count}</Typography>
    </Paper>
  );
}
