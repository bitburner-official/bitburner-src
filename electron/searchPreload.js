const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("searchAPI", {
  find: (text, options) => ipcRenderer.send("find-in-page", text, options),
  close: () => ipcRenderer.send("close-search"),
  onResults: (cb) => ipcRenderer.on("find-results", (_e, data) => cb(data)),
  onFocus: (cb) => ipcRenderer.on("focus-input", () => cb()),
  onSearchCurrentText: (cb) => ipcRenderer.on("search-current-text", () => cb()),
});
