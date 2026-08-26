import React, { useContext, useState } from "react";

import { RamCalculationErrorCode } from "../../Script/RamCalculationErrorCodes";
import { calculateRamUsage, type RamCalculationFailure } from "../../Script/RamCalculations";
import { BaseServer } from "../../Server/BaseServer";
import { Settings } from "../../Settings/Settings";
import { useBoolean } from "../../ui/React/hooks";
import { formatRam } from "../../ui/formatNumber";

import type { AST } from "../../utils/ScriptTransformer";
import type { Options } from "./Options";
import { type ScriptFilePath } from "../../Paths/ScriptFilePath";

export interface ScriptEditorContextShape {
  ram: string;
  ramEntries: string[][];
  showRAMError: (error?: RamCalculationFailure) => void;
  updateRAM: (ast: AST, path: ScriptFilePath, server: BaseServer) => void;

  isUpdatingRAM: boolean;
  startUpdatingRAM: () => void;
  finishUpdatingRAM: () => void;

  options: Options;
  saveOptions: (options: Options) => void;
}

const ScriptEditorContext = React.createContext({} as ScriptEditorContextShape);

export function ScriptEditorContextProvider({ children }: { children: React.ReactNode }) {
  const [ram, setRAM] = useState("RAM：???");
  const [ramEntries, setRamEntries] = useState<string[][]>([["???", ""]]);

  const showRAMError: ScriptEditorContextShape["showRAMError"] = (error) => {
    if (!error) {
      setRAM("不适用");
      setRamEntries([["不适用", ""]]);
      return;
    }
    let errorType;
    switch (error.errorCode) {
      case RamCalculationErrorCode.SyntaxError:
        errorType = "语法错误";
        break;
      case RamCalculationErrorCode.ImportError:
        errorType = "导入错误";
        break;
      case RamCalculationErrorCode.InvalidServer:
        errorType = "无效的服务器";
        break;
      default:
        errorType = "未知错误";
        break;
    }
    setRAM(`RAM：${errorType}`);
    setRamEntries([[errorType, error.errorMessage ?? ""]]);
  };

  const updateRAM: ScriptEditorContextShape["updateRAM"] = (ast, path, server) => {
    const ramUsage = calculateRamUsage(ast, path, server.hostname, server.scripts);
    if (ramUsage.cost && ramUsage.cost > 0) {
      const entries = ramUsage.entries?.sort((a, b) => b.cost - a.cost) ?? [];
      const entriesDisp = [];
      for (const entry of entries) {
        entriesDisp.push([`${entry.name} (${entry.type})`, formatRam(entry.cost)]);
      }

      setRAM("RAM：" + formatRam(ramUsage.cost));
      setRamEntries(entriesDisp);
      return;
    }

    if (ramUsage.errorCode !== undefined) {
      showRAMError(ramUsage);
    } else {
      setRAM("RAM：未知错误");
      setRamEntries([["未知错误", ""]]);
    }
  };

  const [isUpdatingRAM, { on: startUpdatingRAM, off: finishUpdatingRAM }] = useBoolean(false);

  const [options, setOptions] = useState<Options>({
    theme: Settings.MonacoTheme,
    insertSpaces: Settings.MonacoInsertSpaces,
    tabSize: Settings.MonacoTabSize,
    detectIndentation: Settings.MonacoDetectIndentation,
    fontFamily: Settings.MonacoFontFamily,
    fontSize: Settings.MonacoFontSize,
    fontLigatures: Settings.MonacoFontLigatures,
    wordWrap: Settings.MonacoWordWrap,
    cursorStyle: Settings.MonacoCursorStyle,
    cursorBlinking: Settings.MonacoCursorBlinking,
    beautifyOnSave: Settings.MonacoBeautifyOnSave,
    stickyScroll: Settings.MonacoStickyScroll,
    minimap: Settings.MonacoMinimap,
    autoSaveOnFocusChange: Settings.MonacoAutoSaveOnFocusChange,
  });

  function saveOptions(options: Options) {
    setOptions(options);
    Settings.MonacoTheme = options.theme;
    Settings.MonacoInsertSpaces = options.insertSpaces;
    Settings.MonacoTabSize = options.tabSize;
    Settings.MonacoDetectIndentation = options.detectIndentation;
    Settings.MonacoFontFamily = options.fontFamily;
    Settings.MonacoFontSize = options.fontSize;
    Settings.MonacoFontLigatures = options.fontLigatures;
    Settings.MonacoCursorStyle = options.cursorStyle;
    Settings.MonacoCursorBlinking = options.cursorBlinking;
    Settings.MonacoWordWrap = options.wordWrap;
    Settings.MonacoBeautifyOnSave = options.beautifyOnSave;
    Settings.MonacoStickyScroll = options.stickyScroll;
    Settings.MonacoMinimap = options.minimap;
    Settings.MonacoAutoSaveOnFocusChange = options.autoSaveOnFocusChange;
  }

  return (
    <ScriptEditorContext.Provider
      value={{
        ram,
        ramEntries,
        showRAMError,
        updateRAM,
        isUpdatingRAM,
        startUpdatingRAM,
        finishUpdatingRAM,
        options,
        saveOptions,
      }}
    >
      {children}
    </ScriptEditorContext.Provider>
  );
}

export const useScriptEditorContext = () => useContext(ScriptEditorContext);
