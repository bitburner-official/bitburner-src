/* eslint-disable no-process-exit */
/* eslint-disable @typescript-eslint/no-var-requires */
const { app, dialog, BrowserWindow, ipcMain, protocol, net } = require("electron");

const log = require("electron-log");
log.catchErrors();

// This handler must be set ASAP to prevent ghost processes.
process.on("uncaughtException", function () {
  // The exception will be logged by electron-log.
  app.quit();
  process.exit(1);
});

// This handler must be set ASAP to prevent ghost processes.
app.on("window-all-closed", () => {
  log.info("Quitting the app...");
  app.quit();
  process.exit(0);
});

require("./steamworksUtils");
const gameWindow = require("./gameWindow");
const utils = require("./utils");
const storage = require("./storage");
const debounce = require("lodash/debounce");
const Store = require("electron-store");
const store = new Store();
const path = require("path");
const { realpathSync, readFileSync } = require("fs");
const { fileURLToPath } = require("url");

log.transports.file.level = store.get("file-log-level", "info");
log.transports.console.level = store.get("console-log-level", "debug");

log.info(`Started app: ${JSON.stringify(process.argv)}`);

let isRestoreDisabled = false;

function setStopProcessHandler(window) {
  const closingWindowHandler = async (e) => {
    // We need to prevent the default closing event to add custom logic
    e.preventDefault();

    // Trigger debounced saves right now before closing
    try {
      await saveToDisk.flush();
    } catch (error) {
      log.error(error);
    }
    try {
      await saveToCloud.flush();
    } catch (error) {
      log.error(error);
    }

    // We'll try to execute javascript on the page to see if we're stuck
    let canRunJS = false;
    window.webContents.executeJavaScript("window.stop(); document.close()", true).then(() => (canRunJS = true));
    setTimeout(() => {
      // Wait a few milliseconds to prevent a race condition before loading the exit screen
      window.webContents.stop();
      window.loadFile("exit.html");
    }, 20);

    // Wait 200ms, if the promise has not yet resolved, let's crash the process since we're possibly in a stuck scenario
    setTimeout(() => {
      if (!canRunJS) {
        // We're stuck, let's crash the process
        log.warn("Forcefully crashing the renderer process");
        window.webContents.forcefullyCrashRenderer();
      }

      log.debug("Destroying the window");
      window.destroy();
    }, 200);
  };

  const clearWindowHandler = () => {
    window = null;
  };

  const receivedGameReadyHandler = async (event, arg) => {
    if (!window) return log.warn("Window was undefined in game info handler");

    log.debug("Received game information", arg);
    window.gameInfo = { ...arg };
    await storage.prepareSaveFolders(window);

    const restoreNewest = store.get("onload-restore-newest", true);
    if (restoreNewest && !isRestoreDisabled) {
      try {
        await storage.restoreIfNewerExists(window);
      } catch (error) {
        log.error("Could not restore newer file", error);
      }
    }
  };

  const receivedDisableRestoreHandler = (event, arg) => {
    if (!window) return log.warn("Window was undefined in disable import handler");

    log.debug(`Disabling auto-restore for ${arg.duration}ms.`);
    isRestoreDisabled = true;
    setTimeout(() => {
      isRestoreDisabled = false;
      log.debug("Re-enabling auto-restore");
    }, arg.duration);
  };

  const receivedGameSavedHandler = (event, arg) => {
    if (!window) return log.warn("Window was undefined in game saved handler");

    const { save, ...other } = arg;
    log.silly("Received game saved info", { ...other, save: `${save.length} bytes` });

    if (storage.isAutosaveEnabled()) {
      saveToDisk(save, arg.fileName);
    }
    if (storage.isCloudEnabled()) {
      const minimumPlaytime = 1000 * 60 * 15;
      const playtime = window.gameInfo.player.playtime;
      log.silly(window.gameInfo);
      if (playtime > minimumPlaytime) {
        saveToCloud(save);
      } else {
        log.debug(`Auto-save to cloud disabled for save game under ${minimumPlaytime}ms (${playtime}ms)`);
      }
    }
  };

  const saveToCloud = debounce(
    async (save) => {
      log.debug("Saving to Steam Cloud ...");
      try {
        const playerId = window.gameInfo.player.identifier;
        await storage.pushSaveDataToSteamCloud(save, playerId);
        log.silly("Saved Game to Steam Cloud");
      } catch (error) {
        log.error(error);
        utils.writeToast(window, "Could not save to Steam Cloud.", "error", 5000);
      }
    },
    store.get("cloud-save-min-time", 1000 * 60 * 15),
    { leading: true },
  );

  const saveToDisk = debounce(
    async (save, fileName) => {
      log.debug("Saving to Disk ...");
      try {
        const file = await storage.saveGameToDisk(window, { save, fileName });
        log.silly(`Saved Game to '${file.replaceAll("\\", "\\\\")}'`);
      } catch (error) {
        log.error(error);
        utils.writeToast(window, "Could not save to disk", "error", 5000);
      }
    },
    store.get("disk-save-min-time", 1000 * 60 * 5),
    { leading: true },
  );

  log.debug("Adding closing handlers");
  ipcMain.on("push-game-ready", receivedGameReadyHandler);
  ipcMain.on("push-game-saved", receivedGameSavedHandler);
  ipcMain.on("push-disable-restore", receivedDisableRestoreHandler);
  window.on("closed", clearWindowHandler);
  window.on("close", closingWindowHandler);
}

async function startWindow(noScript) {
  return gameWindow.createWindow(noScript);
}

global.app_handlers = {
  stopProcess: setStopProcessHandler,
};

let window;

app.on("ready", async () => {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    await dialog.showMessageBox(undefined, {
      title: "Bitburner",
      message: "Failed to launch",
      detail: "Bitburner is already running. Please do not launch the game multiple times.",
      type: "error",
      buttons: ["OK"],
    });
    app.quit();
    return;
  }
  app.on("second-instance", (event, commandLine, workingDirectory, additionalData) => {
    log.error("A second instance is launched", event, commandLine, workingDirectory, additionalData);
    // The player tried to run a second instance. We should focus the current window.
    if (!window) {
      return;
    }
    if (window.isMinimized()) {
      window.restore();
    }
    window.focus();
  });

  // Intercept file protocol requests and only let valid requests through
  protocol.handle("file", ({ url, method }) => {
    let filePath;
    let realPath;
    let relativePath;
    /**
     * "realpathSync" will throw an error if "filePath" points to a non-existent file. If an error is thrown here, the
     * Electron app will not write any error logs, and the request will fail silently. We can use fs.existsSync to check
     * "filePath" before using it, but it's best to try-catch the entire code block.
     */
    try {
      filePath = fileURLToPath(url);
      realPath = realpathSync(filePath);
      relativePath = path.relative(__dirname, realPath);
      // Only allow access to files in "dist" folder or html files in the same directory
      if (method === "GET" && (relativePath.startsWith("dist") || relativePath.match(/^[a-zA-Z-_]*\.html/))) {
        const customHeaders = {};
        if (relativePath.endsWith(".wasm")) {
          customHeaders["Content-Type"] = "application/wasm";
        }
        return new Response(readFileSync(realPath), { headers: new Headers(customHeaders) });
      }
    } catch (error) {
      log.error(error);
    }
    log.error(
      `Tried to access a page outside the sandbox. Url: ${url}. FilePath: ${filePath}. RealPath: ${realPath}.` +
        ` __dirname: ${__dirname}. RelativePath: ${relativePath}. Method: ${method}.`,
    );
    return new Response(null, { status: 403 });
  });

  log.info("Application is ready!");
  if (process.argv.includes("--export-save")) {
    window = new BrowserWindow({ show: false });
    await window.loadFile("export.html");
    window.show();
    setStopProcessHandler(window);
    await utils.exportSave(window);
  } else {
    window = await startWindow(process.argv.includes("--no-scripts"));
    if (global.steamworksError) {
      await dialog.showMessageBox(window, {
        title: "Bitburner",
        message: "Could not connect to Steam",
        detail: `${global.steamworksError.message}\n\nYou won't be able to receive achievements until this is resolved and you restart the game.`,
        type: "warning",
        buttons: ["OK"],
      });
    }
  }
});
