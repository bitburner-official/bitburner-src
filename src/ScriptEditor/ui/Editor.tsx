import * as monaco from "monaco-editor";
import * as React from "react";
import { useEffect, useRef } from "react";

export type Monaco = typeof monaco;

type EditorProps = {
  /** Editor options */
  options: monaco.editor.IEditorOptions;
  /** Function to be ran prior to mounting editor */
  beforeMount: () => void;
  /** Function to be ran after mounting editor */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  /** Function to be ran every time the code is updated */
  onChange: (newCode?: string) => void;
};

export function Editor({ options, beforeMount, onMount, onChange }: EditorProps) {
  const containerDiv = useRef<HTMLDivElement | null>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const subscription = useRef<monaco.IDisposable | null>(null);

  useEffect(() => {
    if (!containerDiv.current) return;
    // Before initializing monaco editor
    beforeMount();

    // Initialize monaco editor
    editor.current = monaco.editor.create(containerDiv.current, {
      value: "",
      automaticLayout: true,
      language: "javascript",
      ...options,
    });

    // After initializing monaco editor
    onMount(editor.current);
    subscription.current = editor.current.onDidChangeModelContent(() => {
      onChange(editor.current?.getValue());
    });

    // Unmounting
    return () => {
      subscription.current?.dispose();
      editor.current?.getModel()?.dispose();
      editor.current?.dispose();
    };
  }, []);

  return <div ref={containerDiv} style={{ height: "1px", width: "100%", flexGrow: 1 }} />;
}
