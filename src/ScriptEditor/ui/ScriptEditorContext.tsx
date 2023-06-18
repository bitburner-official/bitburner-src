import React, { useContext, useState } from "react";

import { Settings } from "../../Settings/Settings";
import { calculateRamUsage } from "../../Script/RamCalculations";
import { RamCalculationErrorCode } from "../../Script/RamCalculationErrorCodes";
import { formatRam } from "../../ui/formatNumber";
import { useBoolean } from "../../ui/React/hooks";
import { BaseServer } from "../../Server/BaseServer";

import { Options } from "./Options";

export interface ScriptEditorContextShape {
  ram: string;
  ramEntries: string[][];
  updateRAM: (newCode: string | null, server: BaseServer | null) => void;

  isUpdatingRAM: boolean;
  startUpdatingRAM: () => void;
  finishUpdatingRAM: () => void;

  options: Options;
  saveOptions: (options: Options) => void;
}

const ScriptEditorContext = React.createContext({} as ScriptEditorContextShape);

export function ScriptEditorContextProvider({ children, vim }: { children: React.ReactNode; vim: boolean }) {
  const [ram, setRAM] = useState("RAM: ???");
  const [ramEntries, setRamEntries] = useState<string[][]>([["???", ""]]);

  const updateRAM: ScriptEditorContextShape["updateRAM"] = (newCode, server) => {
    if (newCode === null || server === null) {
      setRAM("N/A");
      setRamEntries([["N/A", ""]]);
      return;
    }

    const ramUsage = calculateRamUsage(newCode, server.scripts);
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
      if (ramUsage.errorCode === RamCalculationErrorCode.ImportError) {
        setRAM("RAM: Import Error");
        setRamEntries([["Import Error", ""]]);
      } else if (ramUsage.errorCode === RamCalculationErrorCode.SyntaxError) {
        setRAM("RAM: Syntax Error");
        setRamEntries([["Syntax Error", ramUsage.error?.message ?? ""]]);
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
    vim: vim || Settings.MonacoVim,
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
    Settings.MonacoWordWrap = options.wordWrap;
    Settings.MonacoVim = options.vim;
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
