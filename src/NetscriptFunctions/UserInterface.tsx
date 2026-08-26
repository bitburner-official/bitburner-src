import React from "react";
import { UserInterface as IUserInterface } from "@nsdefs";
import { Settings } from "../Settings/Settings";
import { ThemeEvents } from "../Themes/ui/Theme";
import { defaultTheme } from "../Themes/Themes";
import { defaultStyles } from "../Themes/Styles";
import { CONSTANTS } from "../Constants";
import { commitHash } from "../utils/helpers/commitHash";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { Terminal } from "../Terminal";
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
import { getFriendlyType } from "../utils/TypeAssertion";
import { ConnectLink } from "../Terminal/ui/ConnectLink";
import { Player } from "@player";
import { CompletedProgramName } from "@enums";

/** Converts the provided value to a string and ensures it satisfies the alias condition, throwing if it is not  */
export function parseAsAlias(ctx: NetscriptContext, argName: string, v: unknown): string {
  assertStringWithNSContext(ctx, argName, v);
  const matches = v.match(aliasRegex);
  if (matches === null || matches.length !== 1 || matches[0] !== v) {
    throw helpers.errorMessage(
      ctx,
      `'${argName}' 不能是空字符串，且只能包含字母数字字符或这些符号：_|!%,@-`,
    );
  }
  return v;
}

export function NetscriptUserInterface(): InternalAPI<IUserInterface> {
  return {
    openTail: (ctx, scriptID, host, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, scriptID, host, scriptArgs);
      const runningScriptObj = helpers.getRunningScript(ctx, ident);
      if (runningScriptObj == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return;
      }

      LogBoxEvents.emit(runningScriptObj);
    },

    renderTail: (ctx, _pid = ctx.workerScript.scriptRef.pid) => {
      const pid = helpers.number(ctx, "pid", _pid);
      const runningScriptObj = helpers.getRunningScript(ctx, pid);
      if (runningScriptObj == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
        return;
      }
      runningScriptObj.tailProps?.rerender();
    },

    moveTail: (ctx, _x, _y, _pid = ctx.workerScript.scriptRef.pid) => {
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

    resizeTail: (ctx, _w, _h, _pid = ctx.workerScript.scriptRef.pid) => {
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

    closeTail: (ctx, _pid = ctx.workerScript.scriptRef.pid) => {
      const pid = helpers.number(ctx, "pid", _pid);
      // Emit an event to tell the game to close the tail window if it exists.
      LogBoxCloserEvents.emit(pid);
    },

    setTailTitle: (ctx, title, _pid = ctx.workerScript.scriptRef.pid) => {
      const pid = helpers.number(ctx, "pid", _pid);
      const runningScriptObj = helpers.getRunningScript(ctx, pid);
      if (runningScriptObj == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
        return;
      }
      runningScriptObj.title = typeof title === "string" ? title : wrapUserNode(title);
      runningScriptObj.tailProps?.rerender();
    },

    setTailFontSize: (ctx, _pixel, scriptID, host, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, scriptID, host, scriptArgs);
      const runningScriptObj = helpers.getRunningScript(ctx, ident);
      if (runningScriptObj == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return;
      }
      if (_pixel === undefined) runningScriptObj.tailProps?.setFontSize(undefined);
      else runningScriptObj.tailProps?.setFontSize(helpers.number(ctx, "pixel", _pixel));
    },

    setTailMinimized: (ctx, _minimized, _pid = ctx.workerScript.scriptRef.pid) => {
      const minimized = helpers.boolean(ctx, "minimized", _minimized);
      const pid = helpers.number(ctx, "pid", _pid);
      const runningScriptObj = helpers.getRunningScript(ctx, pid);
      if (runningScriptObj == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(pid));
        return;
      }
      runningScriptObj.tailProps?.setMinimized(minimized);
    },

    windowSize: () => {
      return [window.innerWidth, window.innerHeight];
    },

    getTheme: () => {
      return { ...Settings.theme };
    },

    getStyles: () => {
      return { ...Settings.styles };
    },

    setTheme: (ctx, newTheme) => {
      let newData: unknown;
      try {
        /**
         * assertAndSanitizeMainTheme may mutate its parameter, so we have to clone the user-provided data here.
         */
        newData = structuredClone(newTheme);
        assertAndSanitizeMainTheme(newData);
      } catch (error) {
        helpers.log(ctx, () => `设置主题失败。错误：${error}`);
        return;
      }
      Object.assign(Settings.theme, newData);
      ThemeEvents.emit();
      helpers.log(ctx, () => `成功设置主题`);
    },

    setStyles: (ctx, newStyles) => {
      let newData: unknown;
      try {
        /**
         * assertAndSanitizeStyles may mutate its parameter, so we have to clone the user-provided data here.
         */
        newData = structuredClone(newStyles);
        assertAndSanitizeStyles(newData);
      } catch (error) {
        helpers.log(ctx, () => `设置样式失败。错误：${error}`);
        return;
      }
      Object.assign(Settings.styles, newData);
      ThemeEvents.emit();
      helpers.log(ctx, () => `成功设置样式`);
    },

    resetTheme: (ctx) => {
      Settings.theme = { ...defaultTheme };
      ThemeEvents.emit();
      helpers.log(ctx, () => `已将主题重置为默认`);
    },

    resetStyles: (ctx) => {
      Settings.styles = { ...defaultStyles };
      ThemeEvents.emit();
      helpers.log(ctx, () => `已将样式重置为默认`);
    },

    getGameInfo: () => {
      return {
        version: CONSTANTS.VersionString,
        versionNumber: CONSTANTS.VersionNumber,
        commit: commitHash(),
        platform: navigator.userAgent.toLowerCase().includes(" electron/") ? "Steam" : "Browser",
      };
    },

    clearTerminal: (ctx) => {
      helpers.log(ctx, () => `正在清空终端`);
      Terminal.clear();
    },

    openCodeEditor: (ctx: NetscriptContext, _files, _options) => {
      const files = !_files ? [] : Array.isArray(_files) ? _files : [_files];
      const fileNames = files.map((f) => {
        const path = helpers.filePath(ctx, "fileName", f);
        if (!hasScriptExtension(path) && !hasTextExtension(path)) {
          throw errorMessage(ctx, `只能编辑脚本和文本文件。无效的文件路径：${path}`);
        }
        return path;
      });
      const options = helpers.editorOptions(ctx, _options);
      const useVim = options.vim ?? Settings.MonacoDefaultToVim;
      helpers.log(ctx, () => `正在打开文件：${files.join(", ")}`);
      commonEditor(
        useVim ? "vim" : "nano",
        { args: fileNames, server: ctx.workerScript.getServer(), vim: useVim },
        true,
      );
    },

    alias: (ctx, _alias, _substitution, _isGlobal) => {
      const alias = parseAsAlias(ctx, "alias", _alias);
      const substitution = helpers.string(ctx, "substitution", _substitution);
      const isGlobal = helpers.boolean(ctx, "global", _isGlobal ?? false);
      if (isGlobal) {
        addGlobalAlias(alias, substitution);
        helpers.log(ctx, () => `已添加全局别名 ${alias}：${substitution}`);
      } else {
        addAlias(alias, substitution);
        helpers.log(ctx, () => `已添加别名 ${alias}：${substitution}`);
      }
    },

    unalias: (ctx, _alias) => {
      const alias = parseAsAlias(ctx, "alias", _alias);

      if (!alias) {
        throw helpers.errorMessage(ctx, `'alias' 不能是空字符串。`);
      }

      // This removes from both global and non-global aliases.
      const removedAlias = removeAlias(alias);

      if (removedAlias) {
        helpers.log(ctx, () => `成功移除别名 "${alias}"。`);
      } else {
        helpers.log(ctx, () => `移除别名 "${alias}" 失败：找不到该名称的别名。`);
      }

      return removedAlias;
    },

    getAllAliases: () => {
      const returnMap = new Map<string, { substitution: string; isGlobal: boolean }>();

      for (const alias of Aliases.entries()) {
        returnMap.set(alias[0], { substitution: alias[1], isGlobal: false });
      }
      for (const alias of GlobalAliases.entries()) {
        returnMap.set(alias[0], { substitution: alias[1], isGlobal: true });
      }

      return returnMap;
    },

    renderPage: (_, _node) => {
      Router.toPage(Page.CustomPage, { content: wrapUserNode(_node) });
    },

    createConnectLink: (ctx, _connectPath, _linkText?) => {
      if (!Player.hasProgram(CompletedProgramName.autoLink)) {
        throw errorMessage(ctx, "需要 AutoLink.exe 才能运行。");
      }
      if (!Array.isArray(_connectPath)) {
        throw errorMessage(
          ctx,
          `connectPath 必须是数组。当前类型为 ${getFriendlyType(_connectPath)}。`,
          "TYPE",
        );
      }
      // Enforce validation of server and return resolved hostname
      const connectPath = _connectPath.map((s) => helpers.getServer(ctx, helpers.string(ctx, "connectPath", s))[1]);
      const last = connectPath.at(-1);
      const linkText = helpers.string(ctx, "linkText", _linkText ?? last ?? "无操作");
      return <ConnectLink path={connectPath} text={linkText} />;
    },
  };
}
