import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import { GameTimer } from "./GameTimer";
import type { Infiltration } from "../Infiltration";
import type { SlashModel } from "../model/SlashModel";

interface IProps {
  state: Infiltration;
  stage: SlashModel;
}

export function SlashGame({ stage }: IProps): React.ReactElement {
  return (
    <>
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h5" textAlign="center">
          Attack after the sentinel drops his guard and is distracted.
          <br />
          Do not alert him!
        </Typography>
        <br />
        {stage.phase === 0 && stage.hasMightOfAres && (
          <Box sx={{ my: 1 }}>
            <Typography variant="h5">The sentinel will drop his guard and be distracted in ...</Typography>
            <GameTimer endTimestamp={stage.guardingEndTime} />
            <br />
          </Box>
        )}

        {stage.phase === 0 && <Typography variant="h4">Guarding ...</Typography>}
        {stage.phase === 1 && <Typography variant="h4">Distracted!</Typography>}
        {stage.phase === 2 && <Typography variant="h4">Alerted!</Typography>}
      </Paper>
    </>
  );
}
