import * as monaco from "monaco-editor";
import * as React from "react";
import { useEffect, useRef } from "react";

export type Monaco = typeof monaco;

type EditorProps = {
  /** css height of editor */
  height: string;
  /** Editor options */
  options: monaco.editor.IEditorOptions;
  /** Function to be ran prior to mounting editor */
  beforeMount: () => void;
  /** Function to be ran after mounting editor */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  /** Function to be ran every time the code is updated */
  onChange: (newCode?: string) => void;
};

export function Editor({ height, options, beforeMount, onMount, onChange }: EditorProps) {
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
      editor.current?.dispose();
      const model = editor.current?.getModel();
      model?.dispose();
      subscription.current?.dispose();
    };
  }, []);

  return <div ref={containerDiv} style={{ height: height, width: "100%" }} />;
}
