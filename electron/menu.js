/* eslint-disable @typescript-eslint/no-var-requires */
const { app, Menu, dialog, shell } = require("electron");
const log = require("electron-log");
const Store = require("electron-store");
const utils = require("./utils");
const storage = require("./storage");
const store = new Store();
const { steamworksClient } = require("./steamworksUtils");

function getMenu(window) {
  const canZoomIn = utils.getZoomFactor() <= 2;
  const zoomIn = () => {
    const currentZoom = utils.getZoomFactor();
    const newZoom = currentZoom + 0.1;
    if (newZoom <= 2.0) {
      utils.setZoomFactor(window, newZoom);
      refreshMenu(window);
    } else {
      log.log("Max zoom out");
      utils.writeToast(window, "Cannot zoom in anymore", "warning");
    }
  };

  const canZoomOut = utils.getZoomFactor() >= 0.5;
  const zoomOut = () => {
    const currentZoom = utils.getZoomFactor();
    const newZoom = currentZoom - 0.1;
    if (newZoom >= 0.5) {
      utils.setZoomFactor(window, newZoom);
      refreshMenu(window);
    } else {
      log.log("Max zoom in");
      utils.writeToast(window, "Cannot zoom out anymore", "warning");
    }
  };

  const canResetZoom = utils.getZoomFactor() !== 1;
  const resetZoom = () => {
    utils.setZoomFactor(window, 1);
    refreshMenu(window);
    log.log("Reset zoom");
  };

  return Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Save Game",
          click: () => window.webContents.send("trigger-save"),
        },
        {
          label: "Export Save",
          click: () => window.webContents.send("trigger-game-export"),
        },
        {
          label: "Export Scripts",
          click: () => window.webContents.send("trigger-scripts-export"),
        },
        {
          type: "separator",
        },
        {
          label: "Load Last Save",
          click: async () => {
            try {
              const saveGame = await storage.loadLastFromDisk(window);
              window.webContents.send("push-save-request", { save: saveGame });
            } catch (error) {
              log.error(error);
              utils.writeToast(window, "Could not load last save from disk", "error", 5000);
            }
          },
        },
        {
          label: "Load From File",
          click: async () => {
            const defaultPath = storage.getSaveFolder(window);
            const result = await dialog.showOpenDialog(window, {
              title: "Load From File",
              defaultPath: defaultPath,
              buttonLabel: "Load",
              filters: [
                { name: "Game Saves", extensions: ["json", "json.gz", "txt"] },
                { name: "All", extensions: ["*"] },
              ],
              properties: ["openFile", "dontAddToRecent"],
            });
            if (result.canceled) return;
            const file = result.filePaths[0];

            try {
              const saveGame = await storage.loadFileFromDisk(file);
              window.webContents.send("push-save-request", { save: saveGame });
            } catch (error) {
              log.error(error);
              utils.writeToast(window, "Could not load save from disk", "error", 5000);
            }
          },
        },
        {
          label: "Load From Steam Cloud",
          enabled: storage.isCloudEnabled(),
          click: async () => {
            try {
              const saveData = await storage.getSteamCloudSaveData();
              storage.pushSaveGameForImport(window, saveData, false);
            } catch (error) {
              log.error(error);
              utils.writeToast(window, "Could not load from Steam Cloud", "error", 5000);
            }
          },
        },
        {
          type: "separator",
        },
        {
          label: "Auto-Save to Disk",
          type: "checkbox",
          checked: storage.isAutosaveEnabled(),
          click: (menuItem) => {
            storage.setAutosaveConfig(menuItem.checked);
            utils.writeToast(window, `${menuItem.checked ? "Enabled" : "Disabled"} Auto-Save to Disk`, "info", 5000);
            refreshMenu(window);
          },
        },
        {
          label: "Auto-Save to Steam Cloud",
          type: "checkbox",
          enabled: steamworksClient !== undefined,
          checked: storage.isCloudEnabled(),
          click: (menuItem) => {
            storage.setCloudEnabledConfig(menuItem.checked);
            utils.writeToast(
              window,
              `${menuItem.checked ? "Enabled" : "Disabled"} Auto-Save to Steam Cloud`,
              "info",
              5000,
            );
            refreshMenu(window);
          },
        },
        {
          label: "Restore Newest on Load",
          type: "checkbox",
          checked: store.get("onload-restore-newest", true),
          click: (menuItem) => {
            store.set("onload-restore-newest", menuItem.checked);
            utils.writeToast(
              window,
              `${menuItem.checked ? "Enabled" : "Disabled"} Restore Newest on Load`,
              "info",
              5000,
            );
            refreshMenu(window);
          },
        },
        {
          type: "separator",
        },
        {
          label: "Open Directory",
          submenu: [
            {
              label: "Open Game Directory",
              click: () => shell.openPath(app.getAppPath()),
            },
            {
              label: "Open Saves Directory",
              click: () => {
                const path = storage.getSaveFolder(window);
                shell.openPath(path);
              },
            },
            {
              label: "Open Logs Directory",
              click: () => shell.openPath(app.getPath("logs")),
            },
            {
              label: "Open Data Directory",
              click: () => shell.openPath(app.getPath("userData")),
            },
          ],
        },
        {
          type: "separator",
        },
        {
          label: "Quit",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
      ],
    },
    {
      label: "Reloads",
      submenu: [
        {
          label: "Reload",
          accelerator: "f5",
          click: () => window.loadFile("index.html"),
        },
        {
          label: "Reload && Kill All Scripts",
          click: () => utils.reloadAndKill(window, true),
        },
      ],
    },
    {
      label: "Fullscreen",
      submenu: [
        {
          label: "Toggle",
          accelerator: "f9",
          click: (() => {
            let full = false;
            return () => {
              full = !full;
              window.setFullScreen(full);
            };
          })(),
        },
      ],
    },
    {
      label: "Zoom",
      submenu: [
        {
          label: "Zoom In",
          enabled: canZoomIn,
          accelerator: "CommandOrControl+numadd",
          click: zoomIn,
        },
        {
          label: "Zoom In (non numpad)",
          enabled: canZoomIn,
          visible: false,
          accelerator: "CommandOrControl+Plus",
          acceleratorWorksWhenHidden: true,
          click: zoomIn,
        },
        {
          label: "Zoom Out",
          enabled: canZoomOut,
          accelerator: "CommandOrControl+numsub",
          click: zoomOut,
        },
        {
          label: "Zoom Out (non numpad)",
          enabled: canZoomOut,
          accelerator: "CommandOrControl+-",
          visible: false,
          acceleratorWorksWhenHidden: true,
          click: zoomOut,
        },
        {
          label: "Reset Zoom",
          enabled: canResetZoom,
          accelerator: "CommandOrControl+num0",
          click: resetZoom,
        },
        {
          label: "Reset Zoom (non numpad)",
          enabled: canResetZoom,
          accelerator: "CommandOrControl+0",
          visible: false,
          acceleratorWorksWhenHidden: true,
          click: resetZoom,
        },
      ],
    },
    {
      label: "Debug",
      submenu: [
        {
          label: "Activate",
          accelerator: "f12",
          click: () => window.webContents.openDevTools(),
        },
        {
          label: "Delete Steam Cloud Data",
          enabled: steamworksClient !== undefined,
          click: () => {
            if (steamworksClient.cloud.listFiles().length === 0) {
              return;
            }
            try {
              if (!storage.deleteCloudFile()) {
                log.warn("Cannot delete Steam Cloud data");
              }
            } catch (error) {
              log.error(error);
            }
          },
        },
      ],
    },
  ]);
}

function refreshMenu(window) {
  Menu.setApplicationMenu(getMenu(window));
}

module.exports = {
  getMenu,
  refreshMenu,
};
