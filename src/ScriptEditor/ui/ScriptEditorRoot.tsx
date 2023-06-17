import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

import { Editor } from "./Editor";

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { ScriptFilePath } from "../../Paths/ScriptFilePath";
import { checkInfiniteLoop } from "../../Script/RamCalculations";

import { ns, enums } from "../../NetscriptFunctions";
import { Settings } from "../../Settings/Settings";
import { iTutorialNextStep, ITutorial, iTutorialSteps } from "../../InteractiveTutorial";
import { debounce } from "lodash";
import { saveObject } from "../../SaveObject";
import { loadThemes, makeTheme, sanitizeTheme } from "./themes";
import { GetServer } from "../../Server/AllServers";

import { PromptEvent } from "../../ui/React/PromptManager";

import libSource from "!!raw-loader!../NetscriptDefinitions.d.ts";
import { useRerender } from "../../ui/React/hooks";
import { NetscriptExtra } from "../../NetscriptFunctions/Extra";
import { TextFilePath } from "../../Paths/TextFilePath";

import { dirty, getServerCode } from "./utils";
import { OpenScript } from "./OpenScript";
import { Tabs } from "./Tabs";
import { Toolbar } from "./Toolbar";
import { NoOpenScripts } from "./NoOpenScripts";
import { ScriptEditorContextProvider, useScriptEditorContext } from "./ScriptEditorContext";
import { useVimEditor } from "./useVimEditor";

interface IProps {
  // Map of filename -> code
  files: Map<ScriptFilePath | TextFilePath, string>;
  hostname: string;
  vim: boolean;
}

// TODO: try to remove global symbols
let symbolsLoaded = false;
const apiKeys: string[] = [];
export function SetupTextEditor(): void {
  // Function for populating apiKeys using a given layer of the API.
  const api = { args: [], pid: 1, enums, ...ns };
  const hiddenAPI = NetscriptExtra();
  function populate(apiLayer: object = api) {
    for (const [apiKey, apiValue] of Object.entries(apiLayer)) {
      if (apiLayer === api && apiKey in hiddenAPI) continue;
      apiKeys.push(apiKey);
      if (typeof apiValue === "object") populate(apiValue);
    }
  }
  populate();
}

const openScripts: OpenScript[] = [];
let currentScript: OpenScript | null = null;

function Root(props: IProps): React.ReactElement {
  const rerender = useRerender();
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  const { options, updateRAM, startUpdatingRAM, finishUpdatingRAM } = useScriptEditorContext();

  let decorations: monaco.editor.IEditorDecorationsCollection | undefined;

  // Prevent Crash if script is open on deleted server
  for (let i = openScripts.length - 1; i >= 0; i--) {
    GetServer(openScripts[i].hostname) === null && openScripts.splice(i, 1);
  }
  if (currentScript && GetServer(currentScript.hostname) === null) {
    currentScript = openScripts[0] ?? null;
  }

  useEffect(() => {
    if (currentScript !== null) {
      const tabIndex = currentTabIndex();
      if (typeof tabIndex === "number") onTabClick(tabIndex);
      parseCode(currentScript.code);
    }
  }, []);

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
  });

  // Generates a new model for the script
  function regenerateModel(script: OpenScript): void {
    script.model = monaco.editor.createModel(script.code, script.isTxt ? "plaintext" : "javascript");
  }

  function infLoop(newCode: string): void {
    if (editorRef.current === null || currentScript === null) return;
    if (!decorations) decorations = editorRef.current.createDecorationsCollection();
    if (!currentScript.path.endsWith(".js")) return;
    const awaitWarning = checkInfiniteLoop(newCode);
    if (awaitWarning !== -1) {
      decorations.set([
        {
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
              value: "Possible infinite loop, await something.",
            },
          },
        },
      ]);
    } else decorations.clear();
  }

  const debouncedCodeParsing = debounce((newCode: string) => {
    infLoop(newCode);
    updateRAM(
      !currentScript || currentScript.isTxt ? null : newCode,
      currentScript && GetServer(currentScript.hostname),
    );
    finishUpdatingRAM();
  }, 300);

  function parseCode(newCode: string) {
    startUpdatingRAM();
    debouncedCodeParsing(newCode);
  }

  // How to load function definition in monaco
  // https://github.com/Microsoft/monaco-editor/issues/1415
  // https://microsoft.github.io/monaco-editor/api/modules/monaco.languages.html
  // https://www.npmjs.com/package/@monaco-editor/react#development-playground
  // https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages
  // https://github.com/threehams/typescript-error-guide/blob/master/stories/components/Editor.tsx#L11-L39
  // https://blog.checklyhq.com/customizing-monaco/
  // Before the editor is mounted
  function beforeMount(): void {
    if (symbolsLoaded) return;
    // Setup monaco auto completion
    symbolsLoaded = true;
    (async function () {
      // We have to improve the default js language otherwise theme sucks
      const jsLanguage = monaco.languages.getLanguages().find((l) => l.id === "javascript");
      // Unsupported function is not exposed in monaco public API.
      const l = await (jsLanguage as any).loader();
      // replaced the bare tokens with regexes surrounded by \b, e.g. \b{token}\b which matches a word-break on either side
      // this prevents the highlighter from highlighting pieces of variables that start with a reserved token name
      l.language.tokenizer.root.unshift([new RegExp("\\bns\\b"), { token: "ns" }]);
      for (const symbol of apiKeys)
        l.language.tokenizer.root.unshift([new RegExp(`\\b${symbol}\\b`), { token: "netscriptfunction" }]);
      const otherKeywords = ["let", "const", "var", "function"];
      const otherKeyvars = ["true", "false", "null", "undefined"];
      otherKeywords.forEach((k) =>
        l.language.tokenizer.root.unshift([new RegExp(`\\b${k}\\b`), { token: "otherkeywords" }]),
      );
      otherKeyvars.forEach((k) =>
        l.language.tokenizer.root.unshift([new RegExp(`\\b${k}\\b`), { token: "otherkeyvars" }]),
      );
      l.language.tokenizer.root.unshift([new RegExp("\\bthis\\b"), { token: "this" }]);
    })();

    const source = (libSource + "").replace(/export /g, "");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(source, "netscript.d.ts");
    monaco.languages.typescript.typescriptDefaults.addExtraLib(source, "netscript.d.ts");
    loadThemes(monaco.editor.defineTheme);
    sanitizeTheme(Settings.EditorTheme);
    monaco.editor.defineTheme("customTheme", makeTheme(Settings.EditorTheme));
  }

  // When the editor is mounted
  function onMount(editor: IStandaloneCodeEditor): void {
    // Required when switching between site navigation (e.g. from Script Editor -> Terminal and back)
    // the `useEffect()` for vim mode is called before editor is mounted.
    editorRef.current = editor;

    if (!props.files && currentScript !== null) {
      // Open currentscript
      regenerateModel(currentScript);
      editorRef.current.setModel(currentScript.model);
      editorRef.current.setPosition(currentScript.lastPosition);
      editorRef.current.revealLineInCenter(currentScript.lastPosition.lineNumber);
      parseCode(currentScript.code);
      editorRef.current.focus();
      return;
    }
    if (props.files) {
      const files = props.files;

      if (!files.size) {
        editorRef.current.focus();
        return;
      }

      for (const [filename, code] of files) {
        // Check if file is already opened
        const openScript = openScripts.find((script) => script.path === filename && script.hostname === props.hostname);
        if (openScript) {
          // Script is already opened
          if (openScript.model === undefined || openScript.model === null || openScript.model.isDisposed()) {
            regenerateModel(openScript);
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
            monaco.editor.createModel(code, filename.endsWith(".txt") ? "plaintext" : "javascript"),
          );
          openScripts.push(newScript);
          currentScript = newScript;
          editorRef.current.setModel(newScript.model);
          parseCode(newScript.code);
        }
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
    if (Settings.SaveGameOnFileSave) saveObject.saveGame();
  }

  function save(): void {
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
      const ns2 = `exportasyncfunctionmain(ns){while(true){awaitns.hack('n00dles');}}`;
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
    if (Settings.SaveGameOnFileSave) saveObject.saveGame();
    rerender();
  }

  function currentTabIndex(): number | undefined {
    if (currentScript) return openScripts.findIndex((openScript) => currentScript === openScript);
    return undefined;
  }

  function onTabClick(index: number): void {
    if (currentScript !== null) {
      // Save currentScript to openScripts
      const curIndex = currentTabIndex();
      if (curIndex !== undefined) {
        openScripts[curIndex] = currentScript;
      }
    }

    currentScript = openScripts[index];

    if (editorRef.current !== null && openScripts[index] !== null) {
      if (currentScript.model === undefined || currentScript.model.isDisposed()) {
        regenerateModel(currentScript);
      }
      editorRef.current.setModel(currentScript.model);
      editorRef.current.setPosition(currentScript.lastPosition);
      editorRef.current.revealLineInCenter(currentScript.lastPosition.lineNumber);
      parseCode(currentScript.code);
      editorRef.current.focus();
    }
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
            Router.toPage(Page.Terminal);
          }
        },
      });
    }

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
          regenerateModel(currentScript);
        }
        editorRef.current.setModel(currentScript.model);
        editorRef.current.setPosition(currentScript.lastPosition);
        editorRef.current.revealLineInCenter(currentScript.lastPosition.lineNumber);
        editorRef.current.focus();
      }
    }
    rerender();
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
                regenerateModel(openScript);
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

  const { VimStatus } = useVimEditor({
    editor: editorRef.current,
    vim: options.vim,
    onSave: save,
    onOpenNextTab,
    onOpenPreviousTab,
  });

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
        <Editor beforeMount={beforeMount} onMount={onMount} onChange={updateCode} />

        {VimStatus}

        <Toolbar onSave={save} editor={editorRef.current} />
      </div>
      {!currentScript && <NoOpenScripts />}
    </>
  );
}

// Called every time script editor is opened
export function ScriptEditorRoot(props: IProps) {
  return (
    <ScriptEditorContextProvider vim={props.vim}>
      <Root {...props} />
    </ScriptEditorContextProvider>
  );
}
