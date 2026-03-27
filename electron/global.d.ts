import type { BrowserWindow } from "electron";

declare global {
  var steamworksError: Error | undefined;
  var app_handlers: {
    stopProcess: (window: BrowserWindow) => void;
  };
  namespace Electron {
    interface BrowserWindow {
      gameInfo?: {
        player?: {
          identifier: string;
          playtime: number;
          lastSave: number;
        };
        game?: {
          version: string;
          hash: string;
        };
      };
    }
  }
}
