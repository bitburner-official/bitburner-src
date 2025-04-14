/* eslint-disable @typescript-eslint/no-var-requires */
const { steamworksClient } = require("./steamworksUtils");
const log = require("electron-log");

function enableAchievementsInterval(window) {
  // If the Steam API could not be initialized on game start, we'll abort this.
  if (!steamworksClient) {
    return;
  }

  // This is backward but the game fills in an array called `document.achievements` and we retrieve it from
  // here. Hey if it works it works.
  const allSteamAchievements = steamworksClient.achievement.names();
  log.silly(`All Steam achievements ${JSON.stringify(allSteamAchievements)}`);
  const steamAchievements = allSteamAchievements.filter((achievement) =>
    steamworksClient.achievement.isActivated(achievement),
  );
  log.debug(`Player has Steam achievements ${JSON.stringify(steamAchievements)}`);
  const intervalID = setInterval(async () => {
    try {
      const playerAchievements = await window.webContents.executeJavaScript("document.achievements");
      for (const achievement of playerAchievements) {
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

      // The interval probably did not get cleared after a window kill
      log.warn("Clearing achievements timer");
      clearInterval(intervalID);
    }
  }, 1000);
  window.achievementsIntervalID = intervalID;
}

function disableAchievementsInterval(window) {
  if (window.achievementsIntervalID) {
    clearInterval(window.achievementsIntervalID);
  }
}

module.exports = {
  enableAchievementsInterval,
  disableAchievementsInterval,
};
