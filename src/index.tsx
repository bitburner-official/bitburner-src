import React from "react";
import ReactDOM from "react-dom";

import { TTheme as Theme, ThemeEvents, refreshTheme } from "./Themes/ui/Theme";
import { LoadingScreen } from "./ui/LoadingScreen";
import { initElectron } from "./Electron";

import { newRemoteFileApiConnection } from "./RemoteFileAPI/RemoteFileAPI";

import "./css/font.css";

initElectron();
globalThis.React = React;
globalThis.ReactDOM = ReactDOM;
ReactDOM.render(
  <Theme>
    <LoadingScreen />
  </Theme>,
  document.getElementById("root"),
);

// TODO: Remove this workaround when we get rid of material-ui-color and update to React 19+.
/**
 * With built-in MUI components, we usually customize the zIndex via styleOverrides in src\Themes\ui\Theme.tsx. However,
 * material-ui-color uses a prefix for all class names; for example, instead of "MuiPopover-root", it's
 * "ColorPicker-MuiPopover-root". This library does not provide good ways to customize its components extensively, so we
 * have to find a hacky way to work around this problem.
 */
const styleElement = document.createElement("style");
styleElement.textContent = `#color-popover {
  z-index: 20000 !important;
}`;
document.head.appendChild(styleElement);

setTimeout(newRemoteFileApiConnection, 2000);

function rerender(): void {
  refreshTheme();
  ReactDOM.render(
    <Theme>
      <LoadingScreen />
    </Theme>,
    document.getElementById("root"),
  );
}

(function () {
  ThemeEvents.subscribe(rerender);
})();

(function () {
  if (process.env.NODE_ENV === "development" || location.href.startsWith("file://")) return;
  window.onbeforeunload = function () {
    return "Your work will be lost.";
  };
})();

(function () {
  window.print = () => {
    throw new Error("You accidentally called window.print instead of ns.print");
  };
})();

(function () {
  window.prompt = () => {
    throw new Error("You accidentally called window.prompt instead of ns.prompt");
  };
})();
