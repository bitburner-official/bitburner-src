import React from "react";

import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";

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
  /**
   * For each achievement, we need to display the icon and the detail on the same "row" (icon on the left and detail on
   * the right). When the viewport is to small, the detail part of some achievements is "moved" to a separate "row". It
   * looks like this:
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
   * Using "minWidth" fixes this issue by setting a min value for the width of each row
   */
  return (
    <Accordion defaultExpanded={!!allAchievements} disableGutters square sx={{ minWidth: "645px" }}>
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
      <AccordionDetails sx={usePadding ? { pt: 2 } : undefined}>{children}</AccordionDetails>
    </Accordion>
  );
}
