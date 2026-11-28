import React from "react";

import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";

import { Achievement } from "./Achievements";

interface IProps {
  title: string;
  achievements: { achievement: Achievement }[];
  allAchievements?: { achievement: Achievement }[];
  usePadding?: boolean;
}

function steamCount(achievements: { achievement: Achievement }[]): number {
  return achievements.filter((entry) => !entry.achievement.NotInSteam).length;
}

export function AchievementCategory({
  title,
  achievements,
  allAchievements,
  usePadding,
  children,
}: React.PropsWithChildren<IProps>): JSX.Element {
  return (
    <Accordion defaultExpanded={!!allAchievements} disableGutters square>
      <AccordionSummary>
        {allAchievements ? (
          <Typography variant="h5" sx={{ my: 1 }}>
            {title} ({achievements.length}/{allAchievements.length}, {steamCount(achievements)}/
            {steamCount(allAchievements)} for Steam)
          </Typography>
        ) : (
          <Typography variant="h5" color="secondary">
            {title} ({achievements.length} remaining, {steamCount(achievements)} for Steam)
          </Typography>
        )}
      </AccordionSummary>
      <AccordionDetails sx={usePadding ? { pt: 2 } : undefined}>
        {/* With each achievement, we need to display the icon and the detail on the same "row" (icon on the left and
         * detail on the right). When the viewport is too small, the detail part of some achievements is "moved" to a
         * separate "row". It looks like this:
         *
         * <achievement 1>
         *   <icon><detail>
         * </achievement 1>
         * <achievement 2>
         *   <icon>
         *   <detail>
         * </achievement 2>
         * <achievement 3>
         *   <icon><detail>
         * </achievement 3>
         *
         * Setting the width of each achievement to 620px fixes this issue.
         */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 620px)" }}>{children}</Box>
      </AccordionDetails>
    </Accordion>
  );
}
