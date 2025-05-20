import data from "./AchievementData.json";

export type AchievementId = keyof typeof data.achievements;
export const SFAchievementIds = [
  "SF1.1",
  "SF2.1",
  "SF3.1",
  "SF4.1",
  "SF5.1",
  "SF6.1",
  "SF7.1",
  "SF8.1",
  "SF9.1",
  "SF10.1",
  "SF11.1",
  "SF12.1",
  "SF13.1",
  "SF14.1",
] as const;
export type SFAchievementId = (typeof SFAchievementIds)[number];
