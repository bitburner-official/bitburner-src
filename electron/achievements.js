/* eslint-disable @typescript-eslint/no-var-requires */
const { ipcMain } = require("electron");
const { steamworksClient } = require("./steamworksUtils");
const log = require("electron-log");

function enableSyncingAchievements() {
  // If the Steam API could not be initialized on game start, we'll abort this.
  if (!steamworksClient) {
    return;
  }
  const allSteamAchievements = steamworksClient.achievement.names();
  log.silly(`All Steam achievements ${JSON.stringify(allSteamAchievements)}`);
  const steamAchievements = allSteamAchievements.filter((achievement) =>
    steamworksClient.achievement.isActivated(achievement),
  );
  log.debug(`Player has Steam achievements ${JSON.stringify(steamAchievements)}`);

  ipcMain.on("activate-achievements", async (_event, data) => {
    if (!data || !Array.isArray(data.achievements)) {
      log.info("Achievement list is invalid. Data:", data);
      return;
    }
    try {
      for (const achievement of data.achievements) {
        // Don't try activating achievements that don't exist Steam-side
        if (!allSteamAchievements.includes(achievement)) {
          continue;
        }
        // Don't spam achievements that have already been recorded
        if (steamAchievements.includes(achievement)) {
          continue;
        }
        log.info(`Granting Steam achievement ${achievement}`);
        if (steamworksClient.achievement.activate(achievement)) {
          steamAchievements.push(achievement);
        } else {
          log.warn(`Cannot grant Steam achievement ${achievement}`);
        }
      }
    } catch (error) {
      log.error(error);
    }
  });
}

module.exports = {
  enableSyncingAchievements,
};
