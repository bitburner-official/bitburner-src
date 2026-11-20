/* eslint-disable @typescript-eslint/no-var-requires */
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronBridge", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = [
      "get-save-data-response",
      "get-save-info-response",
      "push-game-saved",
      "push-game-ready",
      "push-import-result",
      "push-disable-restore",
      "activate-achievements",
      "monaco-editor-focus-changed",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = [
      "get-save-data-request",
      "get-save-info-request",
      "push-save-request",
      "trigger-save",
      "trigger-game-export",
      "trigger-scripts-export",
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

window.addEventListener("DOMContentLoaded", () => {
  const observer = new ResizeObserver(() => ipcRenderer.send("viewport-resized"));
  observer.observe(document.documentElement);
});
