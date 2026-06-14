import { UserInterface as IUserInterface } from "@nsdefs";
import { Settings } from "../Settings/Settings";
import { ThemeEvents } from "../Themes/ui/Theme";
import { defaultTheme } from "../Themes/Themes";
import { defaultStyles } from "../Themes/Styles";
import { CONSTANTS } from "../Constants";
import { commitHash } from "../utils/helpers/commitHash";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { Terminal } from "../../src/Terminal";
import { helpers, wrapUserNode } from "../Netscript/NetscriptHelpers";
import { assertAndSanitizeMainTheme, assertAndSanitizeStyles } from "../JsonSchema/JSONSchemaAssertion";
import { LogBoxCloserEvents, LogBoxEvents } from "../ui/React/LogBoxManager";
import { commonEditor } from "../Terminal/commands/common/editor";
import { hasScriptExtension } from "../Paths/ScriptFilePath";
import { hasTextExtension } from "../Paths/TextFilePath";
import { errorMessage } from "../Netscript/ErrorMessages";
import { addGlobalAlias, addAlias, removeAlias, Aliases, GlobalAliases, aliasRegex } from "../Alias";
import { assertStringWithNSContext } from "../Netscript/TypeAssertion";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";

/** Converts the provided value to a string and ensures it satisfies the alias condition, throwing if it is not  */
export function parseAsAlias(ctx: NetscriptContext, argName: string, v: unknown): string {
  assertStringWithNSContext(ctx, argName, v);
  const matches = v.match(aliasRegex);
  if (matches === null || matches.length !== 1 || matches[0] !== v) {
    throw helpers.errorMessage(
      ctx,
      `'${argName}' must not be an empty string and must contain only alphanumeric characters or any of these symbols: _|!%,@-`,
    );
  }
  return v;
}

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
        const runningScriptObj = helpers.getRunningScript(ctx, pid);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
          return;
        }
        // Emit an event to tell the game to close the tail window if it exists.
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

    setTailMinimized:
      (ctx) =>
      (_minimized, _pid = ctx.workerScript.scriptRef.pid) => {
        const minimized = helpers.boolean(ctx, "minimized", _minimized);
        const pid = helpers.number(ctx, "pid", _pid);
        const runningScriptObj = helpers.getRunningScript(ctx, pid);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
          return;
        }
        runningScriptObj.tailProps?.setMinimized(minimized);
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

    openCodeEditor: (ctx: NetscriptContext) => (_files, _options) => {
      const files = !_files ? [] : Array.isArray(_files) ? _files : [_files];
      const fileNames = files.map((f) => {
        const path = helpers.filePath(ctx, "fileName", f);
        if (!hasScriptExtension(path) && !hasTextExtension(path)) {
          throw errorMessage(ctx, `Only scripts and text files can be edited. Invalid file path: ${path}`);
        }
        return path;
      });
      const options = helpers.editorOptions(ctx, _options);
      const useVim = options.vim ?? Settings.MonacoDefaultToVim;
      helpers.log(ctx, () => `Opening files: ${files.join(", ")}`);
      commonEditor(
        useVim ? "vim" : "nano",
        { args: fileNames, server: ctx.workerScript.getServer(), vim: useVim },
        true,
      );
    },

    alias: (ctx) => (_alias, _substitution, _isGlobal) => {
      const alias = parseAsAlias(ctx, "alias", _alias);
      const substitution = helpers.string(ctx, "substitution", _substitution);
      const isGlobal = helpers.boolean(ctx, "global", _isGlobal ?? false);
      if (isGlobal) {
        addGlobalAlias(alias, substitution);
        helpers.log(ctx, () => `Added global alias ${alias}: ${substitution}`);
      } else {
        addAlias(alias, substitution);
        helpers.log(ctx, () => `Added alias ${alias}: ${substitution}`);
      }
    },

    unalias: (ctx) => (_alias) => {
      const alias = parseAsAlias(ctx, "alias", _alias);

      if (!alias) {
        throw helpers.errorMessage(ctx, `'alias' cannot be an empty string.`);
      }

      // This removes from both global and non-global aliases.
      const removedAlias = removeAlias(alias);

      if (removedAlias) {
        helpers.log(ctx, () => `Successfully removed the "${alias}" alias.`);
      } else {
        helpers.log(ctx, () => `Failed to remove the "${alias}" alias: no alias with that name found.`);
      }

      return removedAlias;
    },

    getAllAliases: () => () => {
      const returnMap = new Map<string, { substitution: string; isGlobal: boolean }>();

      for (const alias of Aliases.entries()) {
        returnMap.set(alias[0], { substitution: alias[1], isGlobal: false });
      }
      for (const alias of GlobalAliases.entries()) {
        returnMap.set(alias[0], { substitution: alias[1], isGlobal: true });
      }

      return returnMap;
    },

    renderPage: () => (_node) => {
      Router.toPage(Page.CustomPage, { content: wrapUserNode(_node) });
    },
  };
}
