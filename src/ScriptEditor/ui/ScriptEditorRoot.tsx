import type { ContentFilePath } from "../../Paths/ContentFile";

import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

import type * as acorn from "acorn";
import * as walk from "acorn-walk";
import { extendAcornWalkForTypeScriptNodes } from "../../ThirdParty/acorn-typescript-walk";
import { extend as extendAcornWalkForJsxNodes } from "acorn-jsx-walk";

import { Editor } from "./Editor";

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { checkInfiniteLoop } from "../../Script/RamCalculations";

import { Settings } from "../../Settings/Settings";
import { iTutorialNextStep, ITutorial, iTutorialSteps } from "../../InteractiveTutorial";
import { debounce } from "lodash";
import { saveObject } from "../../SaveObject";
import { GetServer } from "../../Server/AllServers";

import { PromptEvent } from "../../ui/React/PromptManager";

import { useRerender } from "../../ui/React/hooks";

import { dirty, getServerCode, makeModel } from "./utils";
import { OpenScript } from "./OpenScript";
import { Tabs } from "./Tabs";
import { Toolbar } from "./Toolbar";
import { NoOpenScripts } from "./NoOpenScripts";
import { ScriptEditorContextProvider, useScriptEditorContext } from "./ScriptEditorContext";
import { useVimEditor } from "./useVimEditor";
import { useCallback } from "react";
import { type AST, getFileType, getModuleScript, parseAST } from "../../utils/ScriptTransformer";
import { RamCalculationErrorCode } from "../../Script/RamCalculationErrorCodes";
import { hasScriptExtension, isLegacyScript, type ScriptFilePath } from "../../Paths/ScriptFilePath";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";
import type { BaseServer } from "../../Server/BaseServer";

// Extend acorn-walk to support TypeScript nodes.
extendAcornWalkForTypeScriptNodes(walk.base);

// Extend acorn-walk to support JSX nodes.
extendAcornWalkForJsxNodes(walk.base);

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

interface IProps {
  // Map of filename -> code
  files: Map<ContentFilePath, string>;
  hostname: string;
  vim: boolean;
}
const openScripts: OpenScript[] = [];
let currentScript: OpenScript | null = null;

function Root(props: IProps): React.ReactElement {
  const rerender = useRerender();
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  // This is the workaround for a bug in monaco-editor: https://github.com/microsoft/monaco-editor/issues/4455
  const removeOutlineOfEditor = useCallback(() => {
    if (!editorRef.current) {
      return;
    }
    const containerDomNode = editorRef.current.getContainerDomNode();
    const elements = containerDomNode.getElementsByClassName("monaco-editor");
    if (elements.length === 0) {
      return;
    }
    const editorElement = elements[0];
    (editorElement as HTMLElement).style.outline = "none";
  }, [editorRef]);

  /**
   * The TypeScript compiler needs time to perform type-checking, so in some edge cases, the editor shows the 2792 error
   * ("Cannot find module") even after we created the required models. For example, let's say "ts.ts" script imports
   * "sum" function from "sum.js". The flow is like this:
   * - The player opens "ts.ts". The editor opens with a model for "ts.ts".
   * - TSC starts performing type-checking. This action is asynchronous.
   * - makeModelsForImports is called to dynamically create models for imported modules. We create a model for "sum.js".
   * After this model is created, it's synced to both language workers (check "onDidCreateModel" code in
   * src\ScriptEditor\ScriptEditor.ts).
   * - Before the model of "sum.js" is synced properly, TSC finishes typechecking. At this point, it cannot find
   * relevant data of "sum.js", so it thinks that "sum.js" is not loaded.
   * - The editor shows an error marker at the import code of "sum.js".
   *
   * The error markers will disappear when the player edits the code (the model is updated when the code is changed), so
   * this is not a big problem. Nonetheless, we will still work around this problem to minimize the chance of showing
   * wrong error markers. In order to do that, we check error markers after a short delay (2 seconds); if there is a
   * false-positive error marker, we will reload the model. Reloading the model will force the type-checking to run
   * again.
   */
  const reloadModelOfCurrentScript = debounce(() => {
    if (!currentScript || !editorRef.current) {
      return;
    }
    const markers = monaco.editor.getModelMarkers({
      resource: currentScript.model.uri,
    });
    let needToReloadModel = false;
    for (const marker of markers) {
      // 2792: "Cannot find module" error
      if (marker.code !== "2792") {
        continue;
      }
      needToReloadModel = true;
      break;
    }
    if (needToReloadModel) {
      const currentModel = editorRef.current.getModel();
      currentModel?.setValue(currentModel.getValue());
    }
  }, 2000);

  function makeModelsForImports(ast: AST, server: BaseServer): void {
    if (!currentScript) {
      return;
    }
    // Skipping processing if the current file is not a script or it's a legacy script.
    if (!hasScriptExtension(currentScript.path) || isLegacyScript(currentScript.path)) {
      return;
    }
    // Dynamically load imported scripts.
    walk.simple(
      ast as acorn.Node, // Pretend that ast is an acorn node
      {
        ImportDeclaration: (node: acorn.ImportDeclaration) => {
          if (typeof node.source.value !== "string" || !currentScript) {
            return;
          }
          const importedScript = getModuleScript(
            node.source.value,
            currentScript.path as ScriptFilePath,
            server.scripts,
          );
          /**
           * We use openScripts to store all opened files when the player opens them in the editor. When they edit code,
           * the changed code is in openScripts, regardless of whether they save it. When the player switches from the
           * editor tab to another tab, all models are disposed, so the next time they open the editor, this function
           * will load imported scripts. However, if the player did not save their code, loaded scripts would not
           * contain changed code. Therefore, for each loaded script, we need to check if it is in openScripts. If it
           * is, we use the script content in openScripts.
           */
          let code = importedScript.code;
          for (const openScript of openScripts) {
            if (openScript.hostname !== importedScript.server || openScript.path !== importedScript.filename) {
              continue;
            }
            code = openScript.code;
          }
          makeModel(importedScript.server, importedScript.filename, code);
        },
      },
    );
    // Reload the model to force the type-checking to run again.
    reloadModelOfCurrentScript();
  }

  const { showRAMError, updateRAM, startUpdatingRAM, finishUpdatingRAM } = useScriptEditorContext();

  let decorations: monaco.editor.IEditorDecorationsCollection | undefined;

  // Prevent Crash if script is open on deleted server
  for (let i = openScripts.length - 1; i >= 0; i--) {
    GetServer(openScripts[i].hostname) === null && openScripts.splice(i, 1);
  }
  if (currentScript && GetServer(currentScript.hostname) === null) {
    currentScript = openScripts[0] ?? null;
  }

  const save = useCallback(() => {
    if (currentScript === null) {
      console.error("currentScript is null when it shouldn't be. Unable to save script");
      return;
    }
    // this is duplicate code with saving later.
    if (ITutorial.isRunning && ITutorial.currStep === iTutorialSteps.TerminalTypeScript) {
      //Make sure filename + code properly follow tutorial
      if (currentScript.path !== "n00dles.script" && currentScript.path !== "n00dles.js") {
        dialogBoxCreate("Don't change the script name for now.");
        return;
      }
      const cleanCode = currentScript.code.replace(/\s/g, "");
      const ns1 = "while(true){hack('n00dles');}";
      const ns2 = `/**@param{NS}ns*/exportasyncfunctionmain(ns){while(true){awaitns.hack("n00dles");}}`;
      if (!cleanCode.includes(ns1) && !cleanCode.includes(ns2)) {
        dialogBoxCreate("Please copy and paste the code from the tutorial!");
        return;
      }

      //Save the script
      saveScript(currentScript);
      Router.toPage(Page.Terminal);

      iTutorialNextStep();

      return;
    }

    const server = GetServer(currentScript.hostname);
    if (server === null) throw new Error("Server should not be null but it is.");
    server.writeToContentFile(currentScript.path, currentScript.code);
    if (Settings.SaveGameOnFileSave) {
      saveObject.saveGame().catch((error) => exceptionAlert(error));
    }
    rerender();
  }, [rerender]);

  useEffect(() => {
    function keydown(event: KeyboardEvent): void {
      if (Settings.DisableHotkeys) return;
      //Ctrl + b
      if (event.code == "KeyB" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        Router.toPage(Page.Terminal);
      }

      // CTRL/CMD + S
      if (event.code == "KeyS" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        event.stopPropagation();
        save();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [save]);

  function infLoop(ast: AST, code: string): void {
    if (editorRef.current === null || currentScript === null || isLegacyScript(currentScript.path)) {
      return;
    }
    if (!decorations) {
      decorations = editorRef.current.createDecorationsCollection();
    }
    const possibleLines = checkInfiniteLoop(ast, code);
    if (possibleLines.length !== 0) {
      decorations.set(
        possibleLines.map((awaitWarning) => ({
          range: {
            startLineNumber: awaitWarning,
            startColumn: 1,
            endLineNumber: awaitWarning,
            endColumn: 10,
          },
          options: {
            isWholeLine: true,
            glyphMarginClassName: "myGlyphMarginClass",
            glyphMarginHoverMessage: {
              value:
                "Possible infinite loop, await something. If this is a false positive, use `// @ignore-infinite` to suppress.",
            },
          },
        })),
      );
    } else {
      decorations.clear();
    }
  }

  const debouncedCodeParsing = debounce((newCode: string) => {
    let server;
    if (!currentScript || !hasScriptExtension(currentScript.path) || !(server = GetServer(currentScript.hostname))) {
      showRAMError();
      return;
    }
    let ast;
    try {
      ast = parseAST(newCode, getFileType(currentScript.path));
      makeModelsForImports(ast, server);
    } catch (error) {
      showRAMError({
        errorCode: RamCalculationErrorCode.SyntaxError,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return;
    }
    infLoop(ast, newCode);
    updateRAM(ast, currentScript.path, server);
    finishUpdatingRAM();
  }, 300);

  const parseCode = (newCode: string) => {
    startUpdatingRAM();
    debouncedCodeParsing(newCode);
  };

  // When the editor is mounted
  function onMount(editor: IStandaloneCodeEditor): void {
    // Required when switching between site navigation (e.g. from Script Editor -> Terminal and back)
    // the `useEffect()` for vim mode is called before editor is mounted.
    editorRef.current = editor;

    // Open current script. This happens when the player switch tabs and open the editor tab.
    if (props.files.size === 0 && currentScript !== null) {
      currentScript.regenerateModel();
      editorRef.current.setModel(currentScript.model);
      editorRef.current.setPosition(currentScript.lastPosition);
      editorRef.current.revealLineInCenter(currentScript.lastPosition.lineNumber);
      parseCode(currentScript.code);
      editorRef.current.focus();
      return;
    }

    // This happens when the player opens scripts by using nano/vim.
    for (const [filename, code] of props.files) {
      // Check if file is already opened
      const openScript = openScripts.find((script) => script.path === filename && script.hostname === props.hostname);
      if (openScript) {
        // Script is already opened
        if (openScript.model === undefined || openScript.model === null || openScript.model.isDisposed()) {
          openScript.regenerateModel();
        }

        currentScript = openScript;
        editorRef.current.setModel(openScript.model);
        editorRef.current.setPosition(openScript.lastPosition);
        editorRef.current.revealLineInCenter(openScript.lastPosition.lineNumber);
        parseCode(openScript.code);
      } else {
        // Open script
        const newScript = new OpenScript(
          filename,
          code,
          props.hostname,
          new monaco.Position(0, 0),
          makeModel(props.hostname, filename, code),
          props.vim,
        );
        openScripts.push(newScript);
        currentScript = newScript;
        editorRef.current.setModel(newScript.model);
        parseCode(newScript.code);
      }
    }

    editorRef.current.focus();
  }

  // When the code is updated within the editor
  function updateCode(newCode?: string): void {
    if (newCode === undefined) return;
    // parseCode includes ram check and infinite loop detection
    parseCode(newCode);
    if (editorRef.current === null) return;
    const newPos = editorRef.current.getPosition();
    if (newPos === null) return;
    if (currentScript !== null) {
      currentScript.code = newCode;
      currentScript.lastPosition = newPos;
    }
  }

  function saveScript(scriptToSave: OpenScript): void {
    const server = GetServer(scriptToSave.hostname);
    if (!server) throw new Error("Server should not be null but it is.");
    // This server helper already handles overwriting, etc.
    server.writeToContentFile(scriptToSave.path, scriptToSave.code);
    if (Settings.SaveGameOnFileSave) {
      saveObject.saveGame().catch((error) => exceptionAlert(error));
    }
  }

  function currentTabIndex(): number | undefined {
    if (currentScript) return openScripts.findIndex((openScript) => currentScript === openScript);
    return undefined;
  }

  function onTabClick(index: number): void {
    if (currentScript !== null) {
      // Save the current position of the cursor.
      const currentPosition = editorRef.current?.getPosition();
      if (currentPosition) {
        currentScript.lastPosition = currentPosition;
      }
      // Save currentScript to openScripts
      const curIndex = currentTabIndex();
      if (curIndex !== undefined) {
        openScripts[curIndex] = currentScript;
      }
    }

    currentScript = openScripts[index];

    if (editorRef.current !== null && openScripts[index] !== null) {
      if (!currentScript.model || currentScript.model.isDisposed()) {
        currentScript.regenerateModel();
      }
      editorRef.current.setModel(currentScript.model);
      editorRef.current.setPosition(currentScript.lastPosition);
      editorRef.current.revealLineInCenter(currentScript.lastPosition.lineNumber);
      parseCode(currentScript.code);
      editorRef.current.focus();
    }
    removeOutlineOfEditor();
  }

  function onTabClose(index: number): void {
    // See if the script on the server is up to date
    const closingScript = openScripts[index];
    const savedScriptCode = closingScript.code;
    const wasCurrentScript = openScripts[index] === currentScript;

    if (dirty(openScripts, index)) {
      PromptEvent.emit({
        txt: `Do you want to save changes to ${closingScript.path} on ${closingScript.hostname}?`,
        resolve: (result: boolean | string) => {
          if (result) {
            // Save changes
            closingScript.code = savedScriptCode;
            saveScript(closingScript);
          }
        },
      });
    }
    //unmounting the editor will dispose all, doesnt hurt to dispose on close aswell
    closingScript.model.dispose();
    openScripts.splice(index, 1);
    if (openScripts.length === 0) {
      currentScript = null;
      Router.toPage(Page.Terminal);
      return;
    }

    // Change current script if we closed it
    if (wasCurrentScript) {
      //Keep the same index unless we were on the last script
      const indexOffset = openScripts.length === index ? -1 : 0;
      currentScript = openScripts[index + indexOffset];
      if (editorRef.current !== null) {
        if (currentScript.model.isDisposed() || !currentScript.model) {
          currentScript.regenerateModel();
        }
        editorRef.current.setModel(currentScript.model);
        editorRef.current.setPosition(currentScript.lastPosition);
        editorRef.current.revealLineInCenter(currentScript.lastPosition.lineNumber);
        parseCode(currentScript.code);
        editorRef.current.focus();
      }
    }
    rerender();
    removeOutlineOfEditor();
  }

  function onTabUpdate(index: number): void {
    const openScript = openScripts[index];
    const serverScriptCode = getServerCode(openScripts, index);
    if (serverScriptCode === null) return;

    if (openScript.code !== serverScriptCode) {
      PromptEvent.emit({
        txt:
          "Do you want to overwrite the current editor content with the contents of " +
          openScript.path +
          " on the server? This cannot be undone.",
        resolve: (result: boolean | string) => {
          if (result) {
            // Save changes
            openScript.code = serverScriptCode;

            // Switch to target tab
            onTabClick(index);

            if (editorRef.current !== null && openScript !== null) {
              if (openScript.model === undefined || openScript.model.isDisposed()) {
                openScript.regenerateModel();
              }
              editorRef.current.setModel(openScript.model);

              editorRef.current.setValue(openScript.code);
              parseCode(openScript.code);
              editorRef.current.focus();
            }
          }
        },
      });
    }
  }

  function onOpenNextTab(step: number): void {
    // Go to the next tab (to the right). Wraps around when at the rightmost tab
    const currIndex = currentTabIndex();
    if (currIndex !== undefined) {
      const nextIndex = (currIndex + step) % openScripts.length;
      onTabClick(nextIndex);
    }
  }

  function onOpenPreviousTab(step: number): void {
    // Go to the previous tab (to the left). Wraps around when at the leftmost tab
    const currIndex = currentTabIndex();
    if (currIndex !== undefined) {
      let nextIndex = currIndex - step;
      while (nextIndex < 0) {
        nextIndex += openScripts.length;
      }
      onTabClick(nextIndex);
    }
  }

  function onUnmountEditor() {
    if (!currentScript) {
      return;
    }
    // Save the current position of the cursor.
    const currentPosition = editorRef.current?.getPosition();
    if (currentPosition) {
      currentScript.lastPosition = currentPosition;
    }
  }

  const { statusBarRef } = useVimEditor({
    editor: editorRef.current,
    vim: currentScript !== null ? currentScript.vimMode : props.vim,
    onSave: save,
    onOpenNextTab,
    onOpenPreviousTab,
  });

  useEffect(() => {
    if (currentScript !== null) {
      const tabIndex = currentTabIndex();
      if (typeof tabIndex === "number") onTabClick(tabIndex);
      parseCode(currentScript.code);
    }
    // disable eslint because we want to run this only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        style={{
          display: currentScript !== null ? "flex" : "none",
          height: "100%",
          width: "100%",
          flexDirection: "column",
        }}
      >
        <Tabs
          scripts={openScripts}
          currentScript={currentScript}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onTabUpdate={onTabUpdate}
        />
        <div style={{ flex: "0 0 5px" }} />
        <Editor onMount={onMount} onChange={updateCode} onUnmount={onUnmountEditor} />

        {statusBarRef.current}

        <Toolbar onSave={save} editor={editorRef.current} />
      </div>
      {!currentScript && <NoOpenScripts />}
    </>
  );
}

// Called every time script editor is opened
export function ScriptEditorRoot(props: IProps) {
  return (
    <ScriptEditorContextProvider>
      <Root {...props} />
    </ScriptEditorContextProvider>
  );
}
