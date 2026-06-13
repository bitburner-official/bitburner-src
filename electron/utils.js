/** @import { BrowserWindow } from "electron" */
/* eslint-disable @typescript-eslint/no-var-requires */
const { app, dialog } = require("electron");
const log = require("electron-log");
const Store = require("electron-store");
const store = new Store();
const arg = require("arg");

/** @param {BrowserWindow} window */
function getRendererProcessUniqueId(window) {
  const rendererProcesses = app
    .getAppMetrics()
    .filter((processMetric) => processMetric.pid === window.webContents.getOSProcessId());
  if (rendererProcesses.length === 0) {
    return null;
  }
  // This should never happen.
  if (rendererProcesses.length > 1) {
    log.error("Found more than 1 renderer process");
    log.info(rendererProcesses);
  }
  const rendererProcess = rendererProcesses[0];
  // Pid may be reused, so we need to use both pid and creationTime to uniquely identify the process.
  return `${rendererProcess.pid}-${rendererProcess.creationTime}`;
}

/**
 * @param {BrowserWindow} window
 * @param {boolean} killScripts
 */
function reloadAndKill(window, killScripts) {
  log.info("Reloading & Killing all scripts...");
  const zoomFactor = getZoomFactor();
  const currentRendererProcessUniqueId = getRendererProcessUniqueId(window);
  log.debug(`Current renderer process unique id: ${currentRendererProcessUniqueId}`);
  window.webContents.forcefullyCrashRenderer();
  window.loadFile("index.html", killScripts ? { query: { noScripts: true } } : {});
  window.once("ready-to-show", () => {
    setZoomFactor(window, zoomFactor);
  });
  // Keep checking whether a new renderer process has been spawned. If not, call loadFile. We need to do this to
  // mitigate the issue of forcefullyCrashRenderer.
  // Check https://github.com/electron/electron/issues/48661 for more information.
  const intervalId = setInterval(() => {
    const rendererProcessUniqueId = getRendererProcessUniqueId(window);
    log.debug(`Renderer process unique id: ${rendererProcessUniqueId}`);
    if (rendererProcessUniqueId !== null && rendererProcessUniqueId !== currentRendererProcessUniqueId) {
      clearInterval(intervalId);
      return;
    }
    window.loadFile("index.html", killScripts ? { query: { noScripts: true } } : {});
  }, 0);
}

function promptForReload(window) {
  detachUnresponsiveAppHandler(window);
  dialog
    .showMessageBox({
      type: "error",
      title: "Bitburner > Application Unresponsive",
      message: "The application is unresponsive, possibly due to an infinite loop in your scripts.",
      detail:
        " Did you forget a ns.sleep(x)?\n\n" +
        "The application will be restarted for you, do you want to kill all running scripts?",
      buttons: ["Restart", "Cancel"],
      defaultId: 0,
      checkboxLabel: "Kill all running scripts",
      checkboxChecked: true,
      noLink: true,
    })
    .then(({ response, checkboxChecked }) => {
      if (response === 0) {
        reloadAndKill(window, checkboxChecked);
      } else {
        attachUnresponsiveAppHandler(window);
      }
    });
}

function attachUnresponsiveAppHandler(window) {
  window.unresponsiveHandler = () => promptForReload(window);
  window.on("unresponsive", window.unresponsiveHandler);
}

function detachUnresponsiveAppHandler(window) {
  window.off("unresponsive", window.unresponsiveHandler);
}

function showErrorBox(title, error) {
  dialog.showErrorBox(title, `${error.name}\n\n${error.message}`);
}

async function writeTerminal(window, message, type = null) {
  await window.webContents.executeJavaScript(`window.appNotifier.terminal("${message}", "${type}");`, true);
}

async function writeToast(window, message, type = "info", duration = 2000) {
  await window.webContents.executeJavaScript(`window.appNotifier.toast("${message}", "${type}", ${duration});`, true);
}

function getZoomFactor() {
  const configZoom = store.get("zoom", 1);
  return configZoom;
}

function setZoomFactor(window, zoom = null) {
  if (zoom === null) {
    zoom = 1;
  } else {
    store.set("zoom", zoom);
  }
  window.webContents.setZoomFactor(zoom);
}

function initializeLogLevelConfig() {
  /**
   * @type {{
   *  ["--file-log-level"]?: string,
   *  ["--console-log-level"]?: string,
   * }}
   */
  let args = {};
  try {
    args = arg(
      {
        "--file-log-level": String,
        "--console-log-level": String,
      },
      { permissive: true, argv: process.argv.slice(1) },
    );
  } catch (error) {
    log.error("Cannot parse arguments", process.argv, error);
  }

  // Set default log levels if no stored config exists.
  if (store.get("file-log-level") === undefined) {
    store.set("file-log-level", "info");
  }
  if (store.get("console-log-level") === undefined) {
    store.set("console-log-level", "debug");
  }

  const validLogLevels = ["error", "warn", "info", "verbose", "debug", "silly"];

  // Override log levels if relevant arguments are provided.
  const parsedFileLogLevel = args["--file-log-level"];
  if (parsedFileLogLevel !== undefined && validLogLevels.includes(parsedFileLogLevel)) {
    store.set("file-log-level", parsedFileLogLevel);
  }
  const parsedConsoleLogLevel = args["--console-log-level"];
  if (parsedConsoleLogLevel !== undefined && validLogLevels.includes(parsedConsoleLogLevel)) {
    store.set("console-log-level", parsedConsoleLogLevel);
  }
}

module.exports = {
  reloadAndKill,
  showErrorBox,
  attachUnresponsiveAppHandler,
  detachUnresponsiveAppHandler,
  writeTerminal,
  writeToast,
  getZoomFactor,
  setZoomFactor,
  initializeLogLevelConfig,
};
