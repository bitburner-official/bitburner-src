import React, { useContext, useState } from "react";

import { Settings } from "../../Settings/Settings";
import { calculateRamUsage } from "../../Script/RamCalculations";
import { RamCalculationErrorCode } from "../../Script/RamCalculationErrorCodes";
import { formatRam } from "../../ui/formatNumber";
import { useBoolean } from "../../ui/React/hooks";
import { BaseServer } from "../../Server/BaseServer";

import { Options } from "./Options";
import { FilePath } from "../../Paths/FilePath";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

export interface ScriptEditorContextShape {
  ram: string;
  ramEntries: string[][];
  updateRAM: (newCode: string | null, filename: FilePath | null, server: BaseServer | null) => void;

  isUpdatingRAM: boolean;
  startUpdatingRAM: () => void;
  finishUpdatingRAM: () => void;

  options: Options;
  saveOptions: (options: Options) => void;
}

const ScriptEditorContext = React.createContext({} as ScriptEditorContextShape);

export function ScriptEditorContextProvider({ children }: { children: React.ReactNode }) {
  const [ram, setRAM] = useState("RAM: ???");
  const [ramEntries, setRamEntries] = useState<string[][]>([["???", ""]]);

  const updateRAM: ScriptEditorContextShape["updateRAM"] = (newCode, filename, server) => {
    if (newCode == null || filename == null || server == null || !hasScriptExtension(filename)) {
      setRAM("N/A");
      setRamEntries([["N/A", ""]]);
      return;
    }
    const ramUsage = calculateRamUsage(newCode, filename, server.scripts, server.hostname);
    if (ramUsage.cost && ramUsage.cost > 0) {
      const entries = ramUsage.entries?.sort((a, b) => b.cost - a.cost) ?? [];
      const entriesDisp = [];
      for (const entry of entries) {
        entriesDisp.push([`${entry.name} (${entry.type})`, formatRam(entry.cost)]);
      }

      setRAM("RAM: " + formatRam(ramUsage.cost));
      setRamEntries(entriesDisp);
      return;
    }

    if (ramUsage.errorCode !== undefined) {
      setRamEntries([["Syntax Error", ramUsage.errorMessage ?? ""]]);
      switch (ramUsage.errorCode) {
        case RamCalculationErrorCode.ImportError:
          setRAM("RAM: Import Error");
          break;
        case RamCalculationErrorCode.SyntaxError:
          setRAM("RAM: Syntax Error");
          break;
      }
    } else {
      setRAM("RAM: Syntax Error");
      setRamEntries([["Syntax Error", ""]]);
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
  }

  return (
    <ScriptEditorContext.Provider
      value={{ ram, ramEntries, updateRAM, isUpdatingRAM, startUpdatingRAM, finishUpdatingRAM, options, saveOptions }}
    >
      {children}
    </ScriptEditorContext.Provider>
  );
}

export const useScriptEditorContext = () => useContext(ScriptEditorContext);
