import React from "react";

import { AchievementList } from "./AchievementList";
import { achievements } from "./Achievements";
import { Box, Typography } from "@mui/material";
import { Player } from "@player";

export function AchievementsRoot(): JSX.Element {
  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h4">成就</Typography>
      <Box mx={2}>
        <Typography>
          成就是针对各种行动和挑战的持久性奖励。少量 Bitburner
          成就在 Steam 中有对应的成就。
        </Typography>
        <AchievementList achievements={Object.values(achievements)} playerAchievements={Player.achievements} />
      </Box>
    </div>
  );
}
