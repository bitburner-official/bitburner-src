# Design new icons

Recommended tool: https://inkscape.org

Steps:

- Clone `$PROJECT_DIR/assets/Steam/achievements/template.svg`.
- Edit the text. If you use non-ascii characters (e.g., emojis), you should convert them to path data: Path -> Object to Path.
- Object -> Align and Distribute ...
  - Relative to: Choose "Page".
  - Press the icon having the tooltip: "Center on vertical axis".
  - Press the icon having the tooltip: "Center on horizontal axis".

Note:

- You should **NOT** use the option "Save and restore window geometry for each document" (Edit -> Preferences -> Interface -> Windows).
- The previous steps are not mandatory, but you should follow them. Doing them helps you catch potential visual issues.

Tips for reviewers of the PR that adds new svg files: Check "sodipodi:docname" in the new svg file. If it does not match the filename, it's very likely the svg file was cloned from another file, but the contributor did not open and double-check it in Inkscape (Inkscape automatically updates "sodipodi:docname" when saving, so if they opened the new file, realigned the position, and saved it, "sodipodi:docname" would match the filename).

# Add achievements

These steps are mandatory:

- Add the new icon (.svg file) to `$PROJECT_DIR/assets/Steam/achievements/icons`.
- Add an entry to `$PROJECT_DIR/src/Achievements/AchievementData.json`.
  - It should match the information of the Steam achievement, if applicable.
  - Order the new achievement entry thematically.
- Add an entry to `$PROJECT_DIR/src/Achievements/Achievements.ts`.
  - Match the order of achievements in `AchievementData.json`.
  - `Icon` must be the name of the .svg file.
  - `NotInSteam` must be true.
- Run `pack-for-web.sh` in `$PROJECT_DIR/assets/Steam/achievements`.
- When committing, remember to commit the changes in `$PROJECT_DIR/dist/icons/achievements`.

Note: If you add a new SFx.1 achievement, you must add its ID to `SFAchievementIds` in `$PROJECT_DIR/src/Achievements/Types.ts`.
