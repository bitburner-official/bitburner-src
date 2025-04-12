# Adding Achievements

- Add a .svg in `./assets/Steam/achievements/real`
- Run `node ./tools/fetch-steam-achievements-data DEVKEYHERE`
  - Get your key here: https://steamcommunity.com/dev/apikey
- Add an entry in `./src/Achievements/AchievementData.json` -> achievements
  - It should match the information for the Steam achievement, if applicable
  - Order the new achievement entry thematically
- Add an entry in `./src/Achievements/Achievements.ts` -> achievements
  - Match the order of achievements in `AchievementData.json`
- Commit `./dist/icons/achievements`
