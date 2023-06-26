import React, { useEffect, useRef } from "react";

import * as monaco from "monaco-editor";

import { useScriptEditorContext } from "./ScriptEditorContext";

interface EditorProps {
  /** Function to be ran prior to mounting editor */
  beforeMount: () => void;
  /** Function to be ran after mounting editor */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  /** Function to be ran every time the code is updated */
  onChange: (newCode?: string) => void;
}

export function Editor(props: EditorProps) {
  const containerDiv = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const subscription = useRef<monaco.IDisposable | null>(null);

  const { options } = useScriptEditorContext();

  useEffect(() => {
    if (!containerDiv.current) return;
    // Before initializing monaco editor
    props.beforeMount();

    // Initialize monaco editor
    editorRef.current = monaco.editor.create(containerDiv.current, {
      value: "",
      automaticLayout: true,
      language: "javascript",
      ...options,
      glyphMargin: true,
    });

    // After initializing monaco editor
    props.onMount(editorRef.current);
    subscription.current = editorRef.current.onDidChangeModelContent(() => {
      props.onChange(editorRef.current?.getValue());
    });

    // Unmounting
    return () => {
      subscription.current?.dispose();
      editorRef.current?.getModel()?.dispose();
      editorRef.current?.dispose();
    };
    // this eslint ignore instruction can potentially cause unobvious bugs (e.g. if `props.onChange` starts using a prop or state).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerDiv} style={{ height: "1px", width: "100%", flexGrow: 1 }} />;
}
