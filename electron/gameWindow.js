/* eslint-disable @typescript-eslint/no-var-requires */
const { app, shell, BrowserWindow } = require("electron");
const log = require("electron-log");
const utils = require("./utils");
const achievements = require("./achievements");
const menu = require("./menu");
const api = require("./api-server");
const path = require("path");
const { windowTracker } = require("./windowTracker");

const debug = process.argv.includes("--debug");

async function createWindow(killall) {
  const setStopProcessHandler = global.app_handlers.stopProcess;
  app.setAppUserModelId("Bitburner");

  let icon;
  if (process.platform == "linux") {
    icon = path.join(__dirname, "icon.png");
  }

  const tracker = windowTracker("main");
  const window = new BrowserWindow({
    icon,
    show: false,
    backgroundThrottling: false,
    backgroundColor: "#000000",
    title: "Bitburner",
    x: tracker.state.x,
    y: tracker.state.y,
    width: tracker.state.width,
    height: tracker.state.height,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nativeWindowOpen: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  setTimeout(() => tracker.track(window), 1000);
  if (tracker.state.isMaximized) window.maximize();

  window.removeMenu();
  noScripts = killall ? { query: { noScripts: killall } } : {};
  window.loadFile("index.html", noScripts);
  window.once("ready-to-show", () => {
    utils.setZoomFactor(window, utils.getZoomFactor());
  });
  window.show();
  if (debug) window.webContents.openDevTools();

  window.webContents.setWindowOpenHandler(({ url }) => {
    // File protocol is allowed because it will use the file protocol intercept from main.js
    if (url.startsWith("file://")) return { action: "allow" };
    // Only http and https requests will be forwarded to browser.
    // By using shell.openExternal and returning action: "deny"
    if (url.startsWith("http://") || url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });

  window.webContents.backgroundThrottling = false;

  achievements.enableAchievementsInterval(window);
  utils.attachUnresponsiveAppHandler(window);

  try {
    await api.initialize(window);
  } catch (error) {
    log.error(error);
    utils.showErrorBox("Error starting http server", error);
  }

  menu.refreshMenu(window);
  setStopProcessHandler(app, window);

  return window;
}

module.exports = {
  createWindow,
};
