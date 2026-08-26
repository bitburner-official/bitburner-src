import { Milestones } from "../Milestones";
import { Milestone } from "../Milestone";
import * as React from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function highestMilestone(milestones: Milestone[]): number {
  let n = -1;
  for (let i = 0; i < milestones.length; i++) {
    if (milestones[i].fulfilled()) n = i;
  }

  return n;
}

export function MilestonesRoot(): JSX.Element {
  const n = highestMilestone(Milestones);
  const milestones = Milestones.map((milestone: Milestone, i: number) => {
    if (i <= n + 1) {
      return (
        <Typography key={i}>
          [{milestone.fulfilled() ? "x" : " "}] {milestone.title()}
        </Typography>
      );
    }
  });
  return (
    <>
      <Typography variant="h4">里程碑</Typography>
      <Box mx={2}>
        <Typography>
          完成里程碑不会给你任何奖励。它们的作用是在你迷茫时为你指引方向。安装强化后，里程碑将会重置。
        </Typography>
        <br />

        <Typography>完成 fl1ght.exe</Typography>
        {milestones}
      </Box>
    </>
  );
}
