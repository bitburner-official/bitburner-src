import React, { useEffect, useRef } from "react";

import * as monaco from "monaco-editor";

import { useScriptEditorContext } from "./ScriptEditorContext";
import { scriptEditor } from "../ScriptEditor";
import { GetAllServers } from "../../Server/AllServers";
import { makeModel } from "../Model";
import { OpenScript } from "./OpenScript";
import { ContentFilePath } from "../../Paths/ContentFile";

interface EditorProps {
  /** Function to be ran after mounting editor */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  /** Function to be ran every time the code is updated */
  onChange: (newCode?: string) => void;
  /** function to open a script */
  openScript: (script: OpenScript) => void;
}

export function Editor({ openScript, onMount, onChange }: EditorProps) {
  const containerDiv = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const subscription = useRef<monaco.IDisposable | null>(null);

  const { options } = useScriptEditorContext();

  useEffect(() => {
    if (!containerDiv.current) return;
    // Before initializing monaco editor
    scriptEditor.initialize();

    for (const server of GetAllServers()) {
      for (const [path, script] of server.scripts.entries()) {
        makeModel(server.hostname, path, script.code);
      }
    }

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

    //Undocumented way to intercept opening of definition
    //This is used to allow ctrl+click to open a definition
    //https://github.com/microsoft/monaco-editor/issues/2000#issuecomment-649506233
    const editorService = (editorRef.current as any)._codeEditorService;
    const openEditorBase = editorService.openCodeEditor.bind(editorService);
    editorService.openCodeEditor = async (input: any, source: any) => {
      const result = await openEditorBase(input, source);
      if (result === null) {
        const model = monaco.editor.getModel(input.resource)!;
        const position = new monaco.Position(
          input?.options?.selection?.startLineNumber ?? 0,
          input?.options?.selection?.startColumn ?? 0,
        );

        editorRef.current!.setModel(model);
        editorRef.current!.setPosition(position);
        const newScript = new OpenScript(
          model.uri.path.slice(1).split(/\/(.*)/, 2)[1] as ContentFilePath,
          model.getValue(),
          model.uri.path.slice(1).split(/(.*)\//, 2)[1],
          position,
          model,
        );
        openScript(newScript);
      }
      return result; // always return the base result
    };

    // Unmounting
    return () => {
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
