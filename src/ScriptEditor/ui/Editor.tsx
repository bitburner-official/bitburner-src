import React, { useEffect, useRef } from "react";

import * as monaco from "monaco-editor";

import { useScriptEditorContext } from "./ScriptEditorContext";
import { scriptEditor } from "../ScriptEditor";

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

    // Initialize monaco editor
    editorRef.current = monaco.editor.create(containerDiv.current, {
      value: "",
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

    // Unmounting
    return () => {
      onUnmount();
      subscription.current?.dispose();
      monaco.editor.getModels().forEach((model) => model.dispose());
      editorRef.current?.dispose();
    };
    // this eslint ignore instruction can potentially cause unobvious bugs
    // (e.g. if `onChange` starts using a prop or state in parent component).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerDiv} style={{ height: "1px", width: "100%", flexGrow: 1 }} />;
}
