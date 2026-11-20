const { ipcMain, WebContentsView } = require("electron");
const path = require("path");
const log = require("electron-log");
const { getDevToolsDockState } = require("./utils");

const SEARCH_WIDTH = 350;
const SEARCH_HEIGHT = 50;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 12;

function attachFindInPage(targetWindow) {
  let isSearchOpen = false;
  let isMonacoEditorFocused = false;

  const searchView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, "searchPreload.js"),
      contextIsolation: true,
    },
  });
  searchView.setBackgroundColor("#00000000");
  searchView.webContents.loadFile(path.join(__dirname, "search.html"));

  const positionSearchView = async () => {
    if (!isSearchOpen || targetWindow.isDestroyed()) {
      return;
    }

    let dipWidth;
    try {
      const cssWidth = await targetWindow.webContents.executeJavaScript("window.innerWidth");
      if (!isSearchOpen || targetWindow.isDestroyed()) {
        return;
      }
      const zoomFactor = targetWindow.webContents.getZoomFactor();
      dipWidth = Math.round(cssWidth * zoomFactor);
    } catch (error) {
      log.error("Error occurred in positionSearchView", error);
      return;
    }

    // isLeftDock may be stale, as explained in getDevToolsDockState, so the search tool may be temporarily
    // mispositioned after the player changes the dock state. We accept this drawback because Electron does not provide
    // a public API to retrieve this value, and other workarounds are fragile because they rely on internal,
    // undocumented values.
    // We could also watch the preference file and rerun positionSearchView() when it changes, but that is not worth the
    // added complexity.
    const isLeftDock = getDevToolsDockState() === "left";
    const offsetX = isLeftDock ? Math.max(0, targetWindow.getContentBounds().width - dipWidth) : 0;

    searchView.setBounds({
      x: offsetX + dipWidth - SEARCH_WIDTH - MARGIN_RIGHT,
      y: MARGIN_TOP,
      width: SEARCH_WIDTH,
      height: SEARCH_HEIGHT,
    });
  };

  const toggleSearch = (show) => {
    if (targetWindow.isDestroyed()) {
      return;
    }
    if (show) {
      if (!isSearchOpen) {
        targetWindow.contentView.addChildView(searchView);
      }
      positionSearchView();
      searchView.webContents.focus();
      searchView.webContents.send("focus-input");
      searchView.webContents.send("search-current-text");
    } else {
      targetWindow.webContents.stopFindInPage("clearSelection");
      targetWindow.contentView.removeChildView(searchView);
      targetWindow.webContents.focus();
    }
    isSearchOpen = show;
  };

  // Reposition on window resize, zoom change, and DevTools splitter drag.
  const handleViewportResize = (event) => {
    if (event.sender !== targetWindow.webContents) {
      return;
    }
    positionSearchView();
  };

  targetWindow.on("resize", positionSearchView);
  targetWindow.webContents.on("zoom-changed", positionSearchView);
  ipcMain.on("viewport-resized", handleViewportResize);

  // Open on Ctrl+F / Cmd+F inside the target window.
  targetWindow.webContents.on("before-input-event", (event, input) => {
    if (
      input.type === "keyDown" &&
      (input.control || input.meta) &&
      input.key.toLowerCase() === "f" &&
      !isMonacoEditorFocused
    ) {
      event.preventDefault();
      toggleSearch(true);
    }
  });

  // Allow Ctrl+F / Cmd+F (re-focus) and Escape inside the search bar itself.
  searchView.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "Escape") {
      event.preventDefault();
      toggleSearch(false);
    } else if (input.type === "keyDown" && (input.control || input.meta) && input.key.toLowerCase() === "f") {
      event.preventDefault();
      searchView.webContents.send("focus-input");
    }
  });

  // Forward match results from targetWindow to searchView.
  targetWindow.webContents.on("found-in-page", (__event, result) => {
    if (result.finalUpdate && !searchView.webContents.isDestroyed()) {
      searchView.webContents.send("find-results", {
        active: result.activeMatchOrdinal,
        total: result.matches,
      });
    }
  });

  const handleFind = (event, text, options) => {
    if (event.sender !== searchView.webContents || typeof text !== "string") {
      return;
    }
    if (text) {
      targetWindow.webContents.findInPage(text, options);
    } else {
      targetWindow.webContents.stopFindInPage("clearSelection");
      searchView.webContents.send("find-results", { active: 0, total: 0 });
    }
  };

  const handleClose = (event) => {
    if (event.sender !== searchView.webContents) {
      return;
    }
    toggleSearch(false);
  };

  const handleMonacoEditorFocusChanged = (event, focused) => {
    if (event.sender !== targetWindow.webContents || typeof focused !== "boolean") {
      return;
    }
    isMonacoEditorFocused = focused;
  };

  ipcMain.on("find-in-page", handleFind);
  ipcMain.on("close-search", handleClose);
  ipcMain.on("monaco-editor-focus-changed", handleMonacoEditorFocusChanged);

  targetWindow.on("closed", () => {
    ipcMain.removeListener("find-in-page", handleFind);
    ipcMain.removeListener("close-search", handleClose);
    ipcMain.removeListener("viewport-resized", handleViewportResize);
    ipcMain.removeListener("monaco-editor-focus-changed", handleMonacoEditorFocusChanged);
    if (!searchView.webContents.isDestroyed()) {
      searchView.webContents.close();
    }
  });

  // Return controls in case we want to toggle the search tool from a menu.
  return {
    open: () => toggleSearch(true),
    close: () => toggleSearch(false),
  };
}

module.exports = { attachFindInPage };
