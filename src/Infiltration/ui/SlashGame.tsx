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
          在哨卫放松警惕并分心之后再发起攻击。
          <br />
          不要惊动他！
        </Typography>
        <br />
        {stage.phase === 0 && stage.hasMightOfAres && (
          <Box sx={{ my: 1 }}>
            <Typography variant="h5">哨卫将在倒计时结束后放松警惕并分心 …</Typography>
            <GameTimer endTimestamp={stage.guardingEndTime} />
            <br />
          </Box>
        )}

        {stage.phase === 0 && <Typography variant="h4">警戒中 …</Typography>}
        {stage.phase === 1 && <Typography variant="h4">分心了！</Typography>}
        {stage.phase === 2 && <Typography variant="h4">被发现了！</Typography>}
      </Paper>
    </>
  );
}
