/* eslint-disable @typescript-eslint/no-var-requires */
const { screen } = require("electron");
const log = require("electron-log");
const debounce = require("lodash/debounce");
const Store = require("electron-store");
const store = new Store();
const storage = require("./storage");

// https://stackoverflow.com/a/68627253
const windowTracker = (windowName) => {
  let window, windowState;
  console.log("WINDOW TRACKER CALLED")
  const setBounds = () => {
    // Restore from appConfig
    if (store.has(`window.${windowName}`)) {
      windowState = store.get(`window.${windowName}`);
      console.log("///////")
      console.log(windowState.autoHideMenuBar);
      console.log(windowState.x);
      return;
    }

    const size = screen.getPrimaryDisplay().workAreaSize;

    // Default
    windowState = {
      x: undefined,
      y: undefined,
      width: size.width,
      height: size.height,
      isMaximized: true,
      autoHideMenuBar: false,
    };
  };
  
  const saveState = debounce(() => {
    if (!window || window.isDestroyed()) {
      log.silly(`Saving window state failed because window is not available`);
      return;
    }

    if (!windowState.isMaximized) {
      windowState = window.getBounds();
    }

    windowState.isMaximized = window.isMaximized();
    log.silly(`Saving window.${windowName} to configs`);
    store.set(`window.${windowName}`, windowState);
    log.silly(windowState);

    console.log("-----TESTING------");
    windowState.autoHideMenuBar = storage.isMenuHideEnabled();
    console.log(windowState.autoHideMenuBar);
  }, 1000);

  const track = (win) => {
    window = win;
    ["resize", "move", "close"].forEach((event) => {
      win.on(event, saveState);
    });
  };

  setBounds();
  console.log("WINDOW TRACKER ABOUT TO RETURN, LOGGING AUTOHIDEMENUBAR VALUE");
  console.log(windowState.autoHideMenuBar);
  console.log("UPDATING VALUE");
  windowState.autoHideMenuBar = storage.isMenuHideEnabled();
  console.log("NEW VALUE");
  console.log(windowState.autoHideMenuBar);
  
  return {
    state: {
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      isMaximized: windowState.isMaximized,
      autoHideMenuBar: windowState.autoHideMenuBar ?? true,
    },
    track,
  };
};

module.exports = { windowTracker };
