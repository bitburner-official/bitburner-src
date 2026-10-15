import React, { useEffect, useRef } from "react";

import * as monaco from "monaco-editor";

import netscriptDefinitions from "../NetscriptDefinitions.d.ts?raw";
/**
 * We use relative paths here to:
 * - Bypass exports in @types/react's package.json
 * - Prevent TypeScript from complaining about importing a declaration file.
 */
import reactTypes from "../../../node_modules/@types/react/index.d.ts?raw";
import reactDomTypes from "../../../node_modules/@types/react-dom/index.d.ts?raw";

import { useScriptEditorContext } from "./ScriptEditorContext";
import { scriptEditor } from "../ScriptEditor";
import { Settings } from "../../Settings/Settings";
import { openScripts } from "../EditorData";
import { isUnsavedFile, saveScript } from "./utils";

interface EditorProps {
  /** Function to be ran after mounting editor */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  /** Function to be ran every time the code is updated */
  onChange: (newCode?: string) => void;
  /** This function is called before unmounting the editor */
  onUnmount: () => void;
}

export function Editor({ onMount, onChange, onUnmount }: EditorProps) {
  const containerDiv = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const subscription = useRef<monaco.IDisposable | null>(null);

  const { options } = useScriptEditorContext();

  useEffect(() => {
    if (!containerDiv.current) return;
    // Before initializing monaco editor
    scriptEditor.initialize();

    /**
     * Create models for NS API, React, and ReactDOM to make them work as extra libraries being available in the global
     * scope. We can do this by calling languageDefaults.addExtraLib in src\ScriptEditor\ScriptEditor.ts. However,
     * monaco editor has a bug that makes function definitions appear as duplicate ones. For more information, please
     * check: https://github.com/microsoft/monaco-editor/issues/3580 and https://github.com/microsoft/monaco-editor/pull/4544.
     */
    const createLibModel = (content: string, fileName: string) => {
      const uri = monaco.Uri.file(fileName);
      // These models are kept alive across unmounts, so only create them once.
      const existingModel = monaco.editor.getModel(uri);
      if (existingModel && !existingModel.isDisposed()) return;
      monaco.editor.createModel(content, "typescript", uri);
    };
    createLibModel(netscriptDefinitions.replace(/^export /gm, ""), "netscript.d.ts");
    createLibModel(reactTypes, "react.d.ts");
    createLibModel(reactDomTypes, "react-dom.d.ts");

    // Initialize monaco editor
    editorRef.current = monaco.editor.create(containerDiv.current, {
      model: null,
      automaticLayout: true,
      language: "javascript",
      ...options,
      glyphMargin: true,
    });

    // After initializing monaco editor
    onMount(editorRef.current);
    subscription.current = editorRef.current.onDidChangeModelContent(() => {
      onChange(editorRef.current?.getValue());
    });
    editorRef.current.onDidBlurEditorWidget(() => {
      if (!Settings.MonacoAutoSaveOnFocusChange) {
        return;
      }
      for (let i = 0; i < openScripts.length; ++i) {
        if (!isUnsavedFile(openScripts, i)) {
          continue;
        }
        saveScript(openScripts[i]);
      }
    });

    // Unmounting
    return () => {
      onUnmount();
      subscription.current?.dispose();
      /**
       * Models are intentionally not disposed here. They hold the undo/redo stack of each open script and the extra
       * libraries synced to the TypeScript worker; disposing them on every page switch would wipe that state and force
       * a full re-typecheck. Models of closed scripts are disposed in onTabClose instead.
       */
      editorRef.current?.dispose();
    };
    // this eslint ignore instruction can potentially cause unobvious bugs
    // (e.g. if `onChange` starts using a prop or state in parent component).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerDiv} style={{ height: "1px", width: "100%", flexGrow: 1 }} />;
}
