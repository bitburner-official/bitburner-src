import React, { useEffect, useRef } from "react";

import * as monaco from "monaco-editor";

import { useScriptEditorContext } from "./ScriptEditorContext";
import { scriptEditor } from "../ScriptEditor";
import { ContentFilePath } from "../../Paths/ContentFile";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { asFilePath } from "../../Paths/FilePath";
import { OpenScript } from "./OpenScript";

interface EditorProps {
  /** Function to be ran after mounting editor */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  /** Function to be ran every time the code is updated */
  onChange: (newCode?: string) => void;
  /** This function is called before unmounting the editor */
  onUnmount: () => void;
  openFile: (hostname: string, filename: ContentFilePath) => OpenScript | undefined;
}

export function Editor({ onMount, onChange, onUnmount, openFile }: EditorProps) {
  const containerDiv = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

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

    const disposables: monaco.IDisposable[] = [];

    disposables.push(
      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current?.getValue());
      }),
    );
    // Register a hook for requests from the editor to open a file (e.g. "go to definition")
    disposables.push(
      monaco.editor.registerEditorOpener({
        async openCodeEditor(source, resource, selectionOrPosition) {
          if (resource.scheme !== "file" || resource.authority === null) {
            return false;
          }
          const path = asFilePath(resource.path.slice(1));
          if (!hasScriptExtension(path) && !hasTextExtension(path)) {
            return false;
          }
          const openScript = openFile(resource.authority, path);
          if (openScript) {
            if (monaco.Position.isIPosition(selectionOrPosition)) {
              editorRef.current?.setPosition(selectionOrPosition);
              editorRef.current?.revealPositionInCenter(selectionOrPosition, monaco.editor.ScrollType.Immediate);
            } else if (monaco.Range.isIRange(selectionOrPosition)) {
              editorRef.current?.setSelection(selectionOrPosition);
              editorRef.current?.revealRangeInCenter(selectionOrPosition, monaco.editor.ScrollType.Immediate);
            }
            return true;
          }
          return false;
        },
      }),
    );

    // Unmounting
    return () => {
      onUnmount();
      disposables.forEach((d) => d.dispose());
      editorRef.current?.dispose();
    };
    // this eslint ignore instruction can potentially cause unobvious bugs
    // (e.g. if `onChange` starts using a prop or state in parent component).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerDiv} style={{ height: "1px", width: "100%", flexGrow: 1 }} />;
}
