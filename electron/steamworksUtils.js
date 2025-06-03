/* eslint-disable @typescript-eslint/no-var-requires */
const steamworks = require("@catloversg/steamworks.js");
const log = require("electron-log");

let steamworksClient;
try {
  // 1812820 is our Steam App ID.
  steamworksClient = steamworks.init(1812820);
} catch (error) {
  if (error.message?.includes("Steam is probably not running")) {
    log.warn(error.message);
  } else {
    log.warn(error);
  }
  global.steamworksError = error;
}

module.exports = {
  steamworksClient,
};
