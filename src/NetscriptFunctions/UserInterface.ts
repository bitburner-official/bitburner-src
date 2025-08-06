import { UserInterface as IUserInterface } from "@nsdefs";
import { Settings } from "../Settings/Settings";
import { ThemeEvents } from "../Themes/ui/Theme";
import { defaultTheme } from "../Themes/Themes";
import { defaultStyles } from "../Themes/Styles";
import { CONSTANTS } from "../Constants";
import { commitHash } from "../utils/helpers/commitHash";
import { InternalAPI } from "../Netscript/APIWrapper";
import { Terminal } from "../../src/Terminal";
import { helpers, wrapUserNode } from "../Netscript/NetscriptHelpers";
import { assertAndSanitizeMainTheme, assertAndSanitizeStyles } from "../JsonSchema/JSONSchemaAssertion";
import { LogBoxCloserEvents, LogBoxEvents } from "../ui/React/LogBoxManager";

export function NetscriptUserInterface(): InternalAPI<IUserInterface> {
  return {
    openTail:
      (ctx) =>
      (scriptID, host, ...scriptArgs) => {
        const ident = helpers.scriptIdentifier(ctx, scriptID, host, scriptArgs);
        const runningScriptObj = helpers.getRunningScript(ctx, ident);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
          return;
        }

        LogBoxEvents.emit(runningScriptObj);
      },

    renderTail:
      (ctx) =>
      (_pid = ctx.workerScript.scriptRef.pid) => {
        const pid = helpers.number(ctx, "pid", _pid);
        const runningScriptObj = helpers.getRunningScript(ctx, pid);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
          return;
        }
        runningScriptObj.tailProps?.rerender();
      },

    moveTail:
      (ctx) =>
      (_x, _y, _pid = ctx.workerScript.scriptRef.pid) => {
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);
        const pid = helpers.number(ctx, "pid", _pid);
        const runningScriptObj = helpers.getRunningScript(ctx, pid);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
          return;
        }
        runningScriptObj.tailProps?.setPosition(x, y);
      },

    resizeTail:
      (ctx) =>
      (_w, _h, _pid = ctx.workerScript.scriptRef.pid) => {
        const w = helpers.number(ctx, "w", _w);
        const h = helpers.number(ctx, "h", _h);
        const pid = helpers.number(ctx, "pid", _pid);
        const runningScriptObj = helpers.getRunningScript(ctx, pid);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
          return;
        }
        runningScriptObj.tailProps?.setSize(w, h);
      },

    closeTail:
      (ctx) =>
      (_pid = ctx.workerScript.scriptRef.pid) => {
        const pid = helpers.number(ctx, "pid", _pid);
        //Emit an event to tell the game to close the tail window if it exists
        LogBoxCloserEvents.emit(pid);
      },

    setTailTitle:
      (ctx) =>
      (title, _pid = ctx.workerScript.scriptRef.pid) => {
        const pid = helpers.number(ctx, "pid", _pid);
        const runningScriptObj = helpers.getRunningScript(ctx, pid);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
          return;
        }
        runningScriptObj.title = typeof title === "string" ? title : wrapUserNode(title);
        runningScriptObj.tailProps?.rerender();
      },

    setTailFontSize:
      (ctx) =>
      (_pixel, scriptID, host, ...scriptArgs) => {
        const ident = helpers.scriptIdentifier(ctx, scriptID, host, scriptArgs);
        const runningScriptObj = helpers.getRunningScript(ctx, ident);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
          return;
        }
        if (_pixel === undefined) runningScriptObj.tailProps?.setFontSize(undefined);
        else runningScriptObj.tailProps?.setFontSize(helpers.number(ctx, "pixel", _pixel));
      },

    windowSize: () => () => {
      return [window.innerWidth, window.innerHeight];
    },

    getTheme: () => () => {
      return { ...Settings.theme };
    },

    getStyles: () => () => {
      return { ...Settings.styles };
    },

    setTheme: (ctx) => (newTheme) => {
      let newData: unknown;
      try {
        /**
         * assertAndSanitizeMainTheme may mutate its parameter, so we have to clone the user-provided data here.
         */
        newData = structuredClone(newTheme);
        assertAndSanitizeMainTheme(newData);
      } catch (error) {
        helpers.log(ctx, () => `Failed to set theme. Errors: ${error}`);
        return;
      }
      Object.assign(Settings.theme, newData);
      ThemeEvents.emit();
      helpers.log(ctx, () => `Successfully set theme`);
    },

    setStyles: (ctx) => (newStyles) => {
      let newData: unknown;
      try {
        /**
         * assertAndSanitizeStyles may mutate its parameter, so we have to clone the user-provided data here.
         */
        newData = structuredClone(newStyles);
        assertAndSanitizeStyles(newData);
      } catch (error) {
        helpers.log(ctx, () => `Failed to set styles. Errors: ${error}`);
        return;
      }
      Object.assign(Settings.styles, newData);
      ThemeEvents.emit();
      helpers.log(ctx, () => `Successfully set styles`);
    },

    resetTheme: (ctx) => () => {
      Settings.theme = { ...defaultTheme };
      ThemeEvents.emit();
      helpers.log(ctx, () => `Reinitialized theme to default`);
    },

    resetStyles: (ctx) => () => {
      Settings.styles = { ...defaultStyles };
      ThemeEvents.emit();
      helpers.log(ctx, () => `Reinitialized styles to default`);
    },

    getGameInfo: () => () => {
      return {
        version: CONSTANTS.VersionString,
        versionNumber: CONSTANTS.VersionNumber,
        commit: commitHash(),
        platform: navigator.userAgent.toLowerCase().includes(" electron/") ? "Steam" : "Browser",
      };
    },

    clearTerminal: (ctx) => () => {
      helpers.log(ctx, () => `Clearing terminal`);
      Terminal.clear();
    },
  };
}
