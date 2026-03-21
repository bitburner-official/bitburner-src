/* eslint-disable @typescript-eslint/no-var-requires */
const { dialog } = require("electron");
const log = require("electron-log");

const Store = require("electron-store");
const store = new Store();

function reloadAndKill(window, killScripts) {
  log.info("Reloading & Killing all scripts...");
  const zoomFactor = getZoomFactor();
  window.webContents.forcefullyCrashRenderer();
  window.loadFile("index.html", killScripts ? { query: { noScripts: true } } : {});
  window.once("ready-to-show", () => {
    setZoomFactor(window, zoomFactor);
  });
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

module.exports = {
  reloadAndKill,
  showErrorBox,
  attachUnresponsiveAppHandler,
  detachUnresponsiveAppHandler,
  writeTerminal,
  writeToast,
  getZoomFactor,
  setZoomFactor,
};
