import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "@i18n";

import { TTheme as Theme, ThemeEvents, refreshTheme } from "./Themes/ui/Theme";
import { LoadingScreen } from "./ui/LoadingScreen";
import { initElectron } from "./Electron";

import { newRemoteFileApiConnection } from "./RemoteFileAPI/RemoteFileAPI";

initElectron();
globalThis.React = React;
globalThis.ReactDOM = ReactDOM;
ReactDOM.render(
  <Suspense fallback="loading">
    <Theme>
      <LoadingScreen />
    </Theme>
  </Suspense>,
  document.getElementById("root"),
);

setTimeout(newRemoteFileApiConnection, 2000);

function rerender(): void {
  refreshTheme();
  ReactDOM.render(
    <Suspense fallback="loading">
      <Theme>
        <LoadingScreen />
      </Theme>
    </Suspense>,
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
