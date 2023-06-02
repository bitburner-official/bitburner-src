import * as monaco from "monaco-editor";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useScriptEditorContext } from "./ScriptEditorContext";

interface EditorProps {
  /** Function to be ran prior to mounting editor */
  beforeMount: () => void;
  /** Function to be ran after mounting editor */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  /** Function to be ran every time the code is updated */
  onChange: (newCode?: string) => void;
}

export function Editor({ beforeMount, onMount, onChange }: EditorProps) {
  const containerDiv = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const subscription = useRef<monaco.IDisposable | null>(null);

  const { options } = useScriptEditorContext();

  useEffect(() => {
    if (!containerDiv.current) return;
    // Before initializing monaco editor
    beforeMount();

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
      subscription.current?.dispose();
      editorRef.current?.getModel()?.dispose();
      editorRef.current?.dispose();
    };
  }, []);

  return <div ref={containerDiv} style={{ height: "1px", width: "100%", flexGrow: 1 }} />;
}
