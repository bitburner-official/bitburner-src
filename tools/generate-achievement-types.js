const { readFileSync, writeFileSync } = require("fs");
const { resolve } = require("path");

const rawData = readFileSync(resolve(__dirname, "../src/Achievements/AchievementData.json"), "utf-8");
const parsedRawData = JSON.parse(rawData);

const regex = /SF\d{1,2}\.1$/;
let sfAchievementIds = "";
let achievementIds = "";
for (const id of Object.keys(parsedRawData.achievements)) {
  if (id.match(regex)) {
    sfAchievementIds += `, "${id}"`;
  } else {
    achievementIds += `, "${id}"`;
  }
}
sfAchievementIds = sfAchievementIds.substring(2);
achievementIds = achievementIds.substring(2);

writeFileSync(
  resolve(__dirname, "../src/Achievements/Types.ts"),
  `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.
export const SFAchievementIds = [${sfAchievementIds}] as const;
export const AchievementIds = [${achievementIds}, ...SFAchievementIds] as const;
export type SFAchievementId = typeof SFAchievementIds[number];
export type AchievementId = typeof AchievementIds[number];
`,
);
