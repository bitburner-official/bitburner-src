import { Player } from "@player";
import { Router } from "./ui/GameRoot";
import { Page } from "./ui/Router";
import { Terminal } from "./Terminal";
import { SnackbarEvents } from "./ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { IReturnStatus, SaveData } from "./types";
import { GetServer } from "./Server/AllServers";
import { ImportPlayerData, ElectronGameData, saveObject } from "./SaveObject";
import { exportScripts } from "./Terminal/commands/download";
import { CONSTANTS } from "./Constants";
import { hash } from "./hash/hash";
import { resolveFilePath } from "./Paths/FilePath";
import { hasScriptExtension } from "./Paths/ScriptFilePath";
import { handleGetSaveDataError } from "./Netscript/ErrorMessages";

interface IReturnWebStatus extends IReturnStatus {
  data?: Record<string, unknown>;
}

declare global {
  interface Window {
    appNotifier: {
      terminal: (message: string, type?: string) => void;
      toast: (message: string, type: ToastVariant, duration?: number) => void;
    };
    appSaveFns: {
      triggerSave: () => Promise<void>;
      triggerGameExport: () => void;
      triggerScriptsExport: () => void;
      getSaveData: () => Promise<{ save: SaveData; fileName: string }>;
      getSaveInfo: (saveData: SaveData) => Promise<ImportPlayerData | undefined>;
      pushSaveData: (saveData: SaveData, automatic?: boolean) => void;
    };
    electronBridge: {
      send: (channel: string, data?: unknown) => void;
      receive: (channel: string, func: (...args: unknown[]) => void) => void;
    };
  }
  interface Document {
    getFiles: () => IReturnWebStatus;
    deleteFile: (filename: string) => IReturnWebStatus;
    saveFile: (filename: string, code: string) => IReturnWebStatus;
  }
}

export function initElectron(): void {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes(" electron/")) {
    // Electron-specific code
    document.achievements = [];
    initWebserver();
    initAppNotifier();
    initSaveFunctions();
    initElectronBridge();
  }
}

function initWebserver(): void {
  document.getFiles = function (): IReturnWebStatus {
    const home = GetServer("home");
    if (home === null) return { res: false, msg: "Home server does not exist." };
    return {
      res: true,
      data: {
        files: [...home.scripts.values()].map((script) => ({
          filename: script.filename,
          code: script.code,
          ramUsage: script.ramUsage,
        })),
      },
    };
  };

  document.deleteFile = function (filename: string): IReturnWebStatus {
    const path = resolveFilePath(filename);
    if (!path) return { res: false, msg: "Invalid file path." };
    const home = GetServer("home");
    if (!home) return { res: false, msg: "Home server does not exist." };
    return home.removeFile(path);
  };

  document.saveFile = function (filename: string, code: string): IReturnWebStatus {
    const path = resolveFilePath(filename);
    if (!path) return { res: false, msg: "Invalid file path." };
    if (!hasScriptExtension(path)) return { res: false, msg: "Invalid file extension: must be a script" };

    code = decodeURIComponent(escape(atob(code)));
    const home = GetServer("home");
    if (!home) return { res: false, msg: "Home server does not exist." };

    const { overwritten } = home.writeToScriptFile(path, code);
    const script = home.scripts.get(path);
    if (!script) return { res: false, msg: "Somehow failed to get script after writing it. This is a bug." };

    const ramUsage = script.getRamUsage(home.scripts);
    return { res: true, data: { overwritten, ramUsage } };
  };
}

// Expose certain alert functions to allow the wrapper to sends message to the game
function initAppNotifier(): void {
  const funcs = {
    terminal: (message: string, type?: string) => {
      const typesFn: Record<string, (s: string) => void> = {
        info: Terminal.info,
        warn: Terminal.warn,
        error: Terminal.error,
        success: Terminal.success,
      };
      let fn;
      if (type) fn = typesFn[type];
      if (!fn) fn = Terminal.print;
      fn.bind(Terminal)(message);
    },
    toast: (message: string, type: ToastVariant, duration = 2000) => SnackbarEvents.emit(message, type, duration),
  };

  // Will be consumed by the electron wrapper.
  window.appNotifier = funcs;
}

function initSaveFunctions(): void {
  const funcs = {
    triggerSave: (): Promise<void> => saveObject.saveGame(true),
    triggerGameExport: (): void => {
      try {
        saveObject.exportGame();
      } catch (error) {
        console.error(error);
        SnackbarEvents.emit("Could not export game.", ToastVariant.ERROR, 2000);
      }
    },
    triggerScriptsExport: (): void => exportScripts("*", Player.getHomeComputer()),
    getSaveData: async (): Promise<{ save: SaveData; fileName: string }> => {
      return {
        save: await saveObject.getSaveData(),
        fileName: saveObject.getSaveFileName(),
      };
    },
    getSaveInfo: async (saveData: SaveData): Promise<ImportPlayerData | undefined> => {
      try {
        const importData = await saveObject.getImportDataFromSaveData(saveData);
        return importData.playerData;
      } catch (error) {
        console.error(error);
        return;
      }
    },
    pushSaveData: (saveData: SaveData, automatic = false): void =>
      Router.toPage(Page.ImportSave, { saveData, automatic }),
  };

  // Will be consumed by the electron wrapper.
  window.appSaveFns = funcs;
}

function initElectronBridge(): void {
  const bridge = window.electronBridge;
  if (!bridge) return;

  bridge.receive("get-save-data-request", async () => {
    let saveData;
    try {
      saveData = await window.appSaveFns.getSaveData();
    } catch (error) {
      handleGetSaveDataError(error);
      return;
    }
    bridge.send("get-save-data-response", saveData);
  });
  bridge.receive("get-save-info-request", async (saveData: unknown) => {
    if (typeof saveData !== "string" && !(saveData instanceof Uint8Array)) {
      throw new Error("Error while trying to get save info");
    }
    const saveInfo = await window.appSaveFns.getSaveInfo(saveData);
    bridge.send("get-save-info-response", saveInfo);
  });
  bridge.receive("push-save-request", (params: unknown) => {
    if (typeof params !== "object") throw new Error("Error trying to push save request");
    const { save, automatic = false } = params as { save: string; automatic: boolean };
    window.appSaveFns.pushSaveData(save, automatic);
  });
  bridge.receive("trigger-save", () => {
    return window.appSaveFns
      .triggerSave()
      .then(() => {
        bridge.send("save-completed");
      })
      .catch((error: unknown) => {
        console.error(error);
        SnackbarEvents.emit("Could not save game.", ToastVariant.ERROR, 2000);
      });
  });
  bridge.receive("trigger-game-export", () => {
    try {
      window.appSaveFns.triggerGameExport();
    } catch (error) {
      console.error(error);
      SnackbarEvents.emit("Could not export game.", ToastVariant.ERROR, 2000);
    }
  });
  bridge.receive("trigger-scripts-export", () => {
    try {
      window.appSaveFns.triggerScriptsExport();
    } catch (error) {
      console.error(error);
      SnackbarEvents.emit("Could not export scripts.", ToastVariant.ERROR, 2000);
    }
  });
}

export function pushGameSaved(data: ElectronGameData): void {
  const bridge = window.electronBridge;
  if (!bridge) return;

  bridge.send("push-game-saved", data);
}

export function pushGameReady(): void {
  const bridge = window.electronBridge;
  if (!bridge) return;

  // Send basic information to the electron wrapper
  bridge.send("push-game-ready", {
    player: {
      identifier: Player.identifier,
      playtime: Player.totalPlaytime,
      lastSave: Player.lastSave,
    },
    game: {
      version: CONSTANTS.VersionString,
      hash: hash(),
    },
  });
}

export function pushImportResult(wasImported: boolean): void {
  const bridge = window.electronBridge;
  if (!bridge) return;

  bridge.send("push-import-result", { wasImported });
  pushDisableRestore();
}

export function pushDisableRestore(): void {
  const bridge = window.electronBridge;
  if (!bridge) return;

  bridge.send("push-disable-restore", { duration: 1000 * 60 });
}
