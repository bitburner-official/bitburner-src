/* eslint-disable @typescript-eslint/no-var-requires */
const steamworks = require("@catloversg/steamworks.js");
const log = require("electron-log");

/** @type {ReturnType<typeof import("@catloversg/steamworks.js").init> | undefined} */
let steamworksClient = undefined;
try {
  // 1812820 is our Steam App ID.
  steamworksClient = steamworks.init(1812820);
} catch (error) {
  if (error instanceof Error) {
    log.warn(error.message);
    global.steamworksError = error;
  } else {
    // This should never happen.
    log.error("steamworks.js threw an error that is not an instance of Error");
    log.error(error);
    global.steamworksError = new Error(typeof error === "string" ? error : String(error), { cause: error });
  }
}

module.exports = {
  steamworksClient,
};
