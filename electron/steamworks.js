/**
MIT License

Copyright (c) 2022 Gabriel Francisco Dos Santos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const { platform, arch } = process;

/** @typedef {typeof import('./steamworksClient.d')} Client */
/** @type {Client} */
let nativeBinding = undefined;

if (platform === "win32" && arch === "x64") {
  nativeBinding = require("./lib/win64/steamworksjs.win32-x64-msvc.node");
} else if (platform === "linux" && arch === "x64") {
  nativeBinding = require("./lib/linux64/steamworksjs.linux-x64-gnu.node");
} else if (platform === "darwin") {
  if (arch === "x64") {
    nativeBinding = require("./lib/osx/steamworksjs.darwin-x64.node");
  } else if (arch === "arm64") {
    nativeBinding = require("./lib/osx/steamworksjs.darwin-arm64.node");
  }
} else {
  throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`);
}

let runCallbacksInterval = undefined;

/**
 * Initialize the steam client or throw an error if it fails
 * @param {number} [appId] - App ID of the game to load, if undefined, will search for a steam_appid.txt file
 * @returns {Omit<Client, 'init' | 'runCallbacks'>}
 */
module.exports.init = (appId) => {
  const { init: internalInit, runCallbacks, restartAppIfNecessary, ...api } = nativeBinding;

  internalInit(appId);

  clearInterval(runCallbacksInterval);
  runCallbacksInterval = setInterval(runCallbacks, 1000 / 30);

  return api;
};

/**
 * @param {number} appId - App ID of the game to load
 * {@link https://partner.steamgames.com/doc/api/steam_api#SteamAPI_RestartAppIfNecessary}
 * @returns {boolean}
 */
module.exports.restartAppIfNecessary = (appId) => nativeBinding.restartAppIfNecessary(appId);

/**
 * Enable the steam overlay on electron
 * @param {boolean} [disableEachFrameInvalidation] - Should attach a single pixel to be rendered each frame
 */
module.exports.electronEnableSteamOverlay = (disableEachFrameInvalidation) => {
  const electron = require("electron");
  if (!electron) {
    throw new Error("Electron module not found");
  }

  electron.app.commandLine.appendSwitch("in-process-gpu");
  electron.app.commandLine.appendSwitch("disable-direct-composition");

  if (!disableEachFrameInvalidation) {
    /** @param {electron.BrowserWindow} browserWindow */
    const attachFrameInvalidator = (browserWindow) => {
      browserWindow.steamworksRepaintInterval = setInterval(() => {
        if (browserWindow.isDestroyed()) {
          clearInterval(browserWindow.steamworksRepaintInterval);
        } else if (!browserWindow.webContents.isPainting()) {
          browserWindow.webContents.invalidate();
        }
      }, 1000 / 60);
    };

    electron.BrowserWindow.getAllWindows().forEach(attachFrameInvalidator);
    electron.app.on("browser-window-created", (_, bw) => attachFrameInvalidator(bw));
  }
};

const SteamCallback = nativeBinding.callback.SteamCallback;
module.exports.SteamCallback = SteamCallback;
