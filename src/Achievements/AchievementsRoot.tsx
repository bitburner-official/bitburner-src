import React from "react";

import { AchievementList } from "./AchievementList";
import { achievements, calculateAchievements } from "./Achievements";
import { Box, Button, Typography } from "@mui/material";
import { Player } from "@player";

export function AchievementsRoot(): JSX.Element {
  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h4">Achievements</Typography>
      <Box mx={2}>
        <Typography>
          Achievements are persistent rewards for various actions and challenges. A limited number of Bitburner
          achievements have corresponding achievements in Steam.
          <br />
          Achievements are automatically checked periodically. You can also manually check with the button below.
        </Typography>
        <Button onClick={() => calculateAchievements()}>Check achievements</Button>
        <AchievementList achievements={Object.values(achievements)} playerAchievements={Player.achievements} />
      </Box>
    </div>
  );
}
