import React from "react";

import { AchievementList } from "./AchievementList";
import { achievements } from "./Achievements";
import { Box, Typography } from "@mui/material";
import { Player } from "@player";

export function AchievementsRoot(): JSX.Element {
  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h4">Achievements</Typography>
      <Box mx={2}>
        <Typography>
          Achievements are persistent rewards for various actions and challenges. A limited number of Bitburner
          achievements have corresponding achievements in Steam.
        </Typography>
        <AchievementList achievements={Object.values(achievements)} playerAchievements={Player.achievements} />
      </Box>
    </div>
  );
}
