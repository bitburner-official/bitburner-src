import React from "react";

import { Box, Typography } from "@mui/material";

import { AchievementCategory } from "./AchievementCategory";
import { AchievementEntry } from "./AchievementEntry";
import { Achievement, PlayerAchievement } from "./Achievements";
import { Settings } from "../Settings/Settings";
import { getFiltersFromHex } from "../ThirdParty/colorUtils";
import { CorruptibleText } from "../ui/React/CorruptibleText";
import { pluralize } from "../utils/I18nUtils";

interface IProps {
  achievements: Achievement[];
  playerAchievements: PlayerAchievement[];
}

export function AchievementList({ achievements, playerAchievements }: IProps): JSX.Element {
  // Need to transform the primary color into css filters to change the color of the SVG.
  const cssPrimary = getFiltersFromHex(Settings.theme.primary);
  const cssSecondary = getFiltersFromHex(Settings.theme.secondary);

  const data = achievements
    .map((achievement) => ({
      achievement,
      unlockedOn: playerAchievements.find((playerAchievement) => playerAchievement.ID === achievement.ID)?.unlockedOn,
    }))
    .sort((a, b) => (b.unlockedOn ?? 0) - (a.unlockedOn ?? 0));

  const unlocked = data.filter((entry) => entry.unlockedOn);

  // Hidden achievements
  const secret = data.filter((entry) => !entry.unlockedOn && entry.achievement.Secret);

  // Locked behind locked content (bitnode x)
  const unavailable = data.filter(
    (entry) =>
      !entry.unlockedOn && !entry.achievement.Secret && entry.achievement.Visible && !entry.achievement.Visible(),
  );

  // Remaining achievements
  const locked = data
    .filter((entry) => !unlocked.map((u) => u.achievement.ID).includes(entry.achievement.ID))
    .filter((entry) => !secret.map((u) => u.achievement.ID).includes(entry.achievement.ID))
    .filter((entry) => !unavailable.map((u) => u.achievement.ID).includes(entry.achievement.ID));

  return (
    <Box sx={{ my: 2 }}>
      {unlocked.length > 0 && (
        <AchievementCategory title="Acquired" achievements={unlocked} allAchievements={data} usePadding={true}>
          {unlocked.map((item) => (
            <AchievementEntry
              key={`unlocked_${item.achievement.ID}`}
              achievement={item.achievement}
              unlockedOn={item.unlockedOn}
              cssFiltersUnlocked={cssPrimary}
              cssFiltersLocked={cssSecondary}
            />
          ))}
        </AchievementCategory>
      )}
      {locked.length > 0 && (
        <AchievementCategory title="Locked" achievements={locked} usePadding={true}>
          {locked.map((item) => (
            <AchievementEntry
              key={`locked_${item.achievement.ID}`}
              achievement={item.achievement}
              cssFiltersUnlocked={cssPrimary}
              cssFiltersLocked={cssSecondary}
            />
          ))}
        </AchievementCategory>
      )}
      {unavailable.length > 0 && (
        <AchievementCategory title="Unavailable" achievements={unavailable}>
          <Typography sx={{ mt: 1 }}>
            {pluralize(unavailable.length, "additional achievement")} hidden behind content you don't have access to.
          </Typography>
        </AchievementCategory>
      )}
      {secret.length > 0 && (
        <AchievementCategory title="Secret" achievements={secret}>
          <Typography color="secondary" sx={{ mt: 1 }}>
            {secret.map((item) => (
              <span key={`secret_${item.achievement.ID}`}>
                <CorruptibleText content={item.achievement.ID} spoiler={true}></CorruptibleText>
                <br />
              </span>
            ))}
          </Typography>
        </AchievementCategory>
      )}
    </Box>
  );
}
