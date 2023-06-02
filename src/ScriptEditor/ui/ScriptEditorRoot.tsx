import React, { useState, useEffect, useRef } from "react";
import { Editor } from "./Editor";
import * as monaco from "monaco-editor";
// @ts-expect-error This library does not have types.
import * as MonacoVim from "monaco-vim";

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

import { OptionsModal } from "./OptionsModal";
import { Options } from "./Options";
import { Player } from "@player";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { ScriptFilePath } from "../../Paths/ScriptFilePath";
import { calculateRamUsage, checkInfiniteLoop } from "../../Script/RamCalculations";
import { RamCalculationErrorCode } from "../../Script/RamCalculationErrorCodes";
import { formatRam } from "../../ui/formatNumber";

import { ns, enums } from "../../NetscriptFunctions";
import { Settings } from "../../Settings/Settings";
import { iTutorialNextStep, ITutorial, iTutorialSteps } from "../../InteractiveTutorial";
import { debounce } from "lodash";
import { saveObject } from "../../SaveObject";
import { loadThemes, makeTheme, sanitizeTheme } from "./themes";
import { GetServer } from "../../Server/AllServers";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import SettingsIcon from "@mui/icons-material/Settings";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import { PromptEvent } from "../../ui/React/PromptManager";
import { Modal } from "../../ui/React/Modal";

import libSource from "!!raw-loader!../NetscriptDefinitions.d.ts";
import { useRerender } from "../../ui/React/hooks";
import { NetscriptExtra } from "../../NetscriptFunctions/Extra";
import { TextFilePath } from "src/Paths/TextFilePath";
import { Tabs } from "./Tabs";
import { OpenScript } from "./OpenScript";
import { dirty, getServerCode } from "./utils";

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

// Called every time script editor is opened
export function Root(props: IProps): React.ReactElement {
  const rerender = useRerender();
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const vimStatusRef = useRef<HTMLElement>(null);
  // monaco-vim does not have types, so this is an any
  const [vimEditor, setVimEditor] = useState<any>(null);

  const [ram, setRAM] = useState("RAM: ???");
  const [ramEntries, setRamEntries] = useState<string[][]>([["???", ""]]);
  const [updatingRam, setUpdatingRam] = useState(false);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [options, setOptions] = useState<Options>({
    theme: Settings.MonacoTheme,
    insertSpaces: Settings.MonacoInsertSpaces,
    tabSize: Settings.MonacoTabSize,
    detectIndentation: Settings.MonacoDetectIndentation,
    fontFamily: Settings.MonacoFontFamily,
    fontSize: Settings.MonacoFontSize,
    fontLigatures: Settings.MonacoFontLigatures,
    wordWrap: Settings.MonacoWordWrap,
    vim: props.vim || Settings.MonacoVim,
  });

  const [ramInfoOpen, setRamInfoOpen] = useState(false);

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

  useEffect(() => {
    // setup monaco-vim
    if (options.vim && editorRef.current && !vimEditor) {
      // Using try/catch because MonacoVim does not have types.
      try {
        setVimEditor(MonacoVim.initVimMode(editorRef.current, vimStatusRef.current));
        MonacoVim.VimMode.Vim.defineEx("write", "w", function () {
          // your own implementation on what you want to do when :w is pressed
          save();
        });
        MonacoVim.VimMode.Vim.defineEx("quit", "q", function () {
          Router.toPage(Page.Terminal);
        });

        const saveNQuit = (): void => {
          save();
          Router.toPage(Page.Terminal);
        };
        // "wqriteandquit" &  "xriteandquit" are not typos, prefix must be found in full string
        MonacoVim.VimMode.Vim.defineEx("wqriteandquit", "wq", saveNQuit);
        MonacoVim.VimMode.Vim.defineEx("xriteandquit", "x", saveNQuit);

        // Setup "go to next tab" and "go to previous tab". This is a little more involved
        // since these aren't Ex commands (they run in normal mode, not after typing `:`)
        MonacoVim.VimMode.Vim.defineAction("nextTabs", function (_cm: any, args: { repeat?: number }) {
          const nTabs = args.repeat ?? 1;
          // Go to the next tab (to the right). Wraps around when at the rightmost tab
          const currIndex = currentTabIndex();
          if (currIndex !== undefined) {
            const nextIndex = (currIndex + nTabs) % openScripts.length;
            onTabClick(nextIndex);
          }
        });
        MonacoVim.VimMode.Vim.defineAction("prevTabs", function (_cm: any, args: { repeat?: number }) {
          const nTabs = args.repeat ?? 1;
          // Go to the previous tab (to the left). Wraps around when at the leftmost tab
          const currIndex = currentTabIndex();
          if (currIndex !== undefined) {
            let nextIndex = currIndex - nTabs;
            while (nextIndex < 0) {
              nextIndex += openScripts.length;
            }
            onTabClick(nextIndex);
          }
        });
        MonacoVim.VimMode.Vim.mapCommand("gt", "action", "nextTabs", {}, { context: "normal" });
        MonacoVim.VimMode.Vim.mapCommand("gT", "action", "prevTabs", {}, { context: "normal" });
        editorRef.current.focus();
      } catch (e) {
        console.error("An error occurred while loading monaco-vim:");
        console.error(e);
      }
    } else if (!options.vim) {
      // When vim mode is disabled
      vimEditor?.dispose();
      setVimEditor(null);
    }

    return () => {
      vimEditor?.dispose();
    };
  }, [options, editorRef.current, vimEditor]);

  // Generates a new model for the script
  function regenerateModel(script: OpenScript): void {
    script.model = monaco.editor.createModel(script.code, script.isTxt ? "plaintext" : "javascript");
  }

  const debouncedCodeParsing = debounce((newCode: string) => {
    infLoop(newCode);
    updateRAM(newCode);
    setUpdatingRam(false);
  }, 300);
  function parseCode(newCode: string) {
    setUpdatingRam(true);
    debouncedCodeParsing(newCode);
  }

  function updateRAM(newCode: string): void {
    if (!currentScript || currentScript.isTxt) {
      setRAM("N/A");
      setRamEntries([["N/A", ""]]);
      return;
    }
    const codeCopy = newCode + "";
    const ramUsage = calculateRamUsage(codeCopy, Player.getCurrentServer().scripts);
    if (ramUsage.cost > 0) {
      const entries = ramUsage.entries?.sort((a, b) => b.cost - a.cost) ?? [];
      const entriesDisp = [];
      for (const entry of entries) {
        entriesDisp.push([`${entry.name} (${entry.type})`, formatRam(entry.cost)]);
      }

      setRAM("RAM: " + formatRam(ramUsage.cost));
      setRamEntries(entriesDisp);
      return;
    }
    let RAM = "";
    const entriesDisp = [];
    switch (ramUsage.cost) {
      case RamCalculationErrorCode.ImportError: {
        RAM = "RAM: Import Error";
        entriesDisp.push(["Import Error", ""]);
        break;
      }
      case RamCalculationErrorCode.SyntaxError:
      default: {
        RAM = "RAM: Syntax Error";
        entriesDisp.push(["Syntax Error", ""]);
        break;
      }
    }
    setRAM(RAM);
    setRamEntries(entriesDisp);
    return;
  }

  // Formats the code
  function beautify(): void {
    if (editorRef.current === null) return;
    editorRef.current.getAction("editor.action.formatDocument")?.run();
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
        <Editor
          beforeMount={beforeMount}
          onMount={onMount}
          onChange={updateCode}
          options={{ ...options, glyphMargin: true }}
        />

        <Box
          ref={vimStatusRef}
          className="vim-display"
          display="flex"
          flexGrow="0"
          flexDirection="row"
          sx={{ p: 1 }}
          alignItems="center"
        ></Box>

        <Box display="flex" flexDirection="row" sx={{ m: 1 }} alignItems="center">
          <Button startIcon={<SettingsIcon />} onClick={() => setOptionsOpen(true)} sx={{ mr: 1 }}>
            Options
          </Button>
          <Button onClick={beautify}>Beautify</Button>
          <Button
            color={updatingRam ? "secondary" : "primary"}
            sx={{ mx: 1 }}
            onClick={() => {
              setRamInfoOpen(true);
            }}
          >
            {ram}
          </Button>
          <Button onClick={save}>Save (Ctrl/Cmd + s)</Button>
          <Button sx={{ mx: 1 }} onClick={() => Router.toPage(Page.Terminal)}>
            Terminal (Ctrl/Cmd + b)
          </Button>
          <Typography>
            {" "}
            <strong>Documentation:</strong>{" "}
            <Link target="_blank" href="https://bitburner-official.readthedocs.io/en/latest/index.html">
              Basic
            </Link>
            {" | "}
            <Link
              target="_blank"
              href="https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.md"
            >
              Full
            </Link>
          </Typography>
        </Box>
        <OptionsModal
          open={optionsOpen}
          onClose={() => {
            sanitizeTheme(Settings.EditorTheme);
            monaco.editor.defineTheme("customTheme", makeTheme(Settings.EditorTheme));
            setOptionsOpen(false);
          }}
          options={{ ...options }}
          save={(options: Options) => {
            sanitizeTheme(Settings.EditorTheme);
            monaco.editor.defineTheme("customTheme", makeTheme(Settings.EditorTheme));
            editorRef.current?.updateOptions(options);
            setOptions(options);
            Settings.MonacoTheme = options.theme;
            Settings.MonacoInsertSpaces = options.insertSpaces;
            Settings.MonacoTabSize = options.tabSize;
            Settings.MonacoDetectIndentation = options.detectIndentation;
            Settings.MonacoFontFamily = options.fontFamily;
            Settings.MonacoFontSize = options.fontSize;
            Settings.MonacoFontLigatures = options.fontLigatures;
            Settings.MonacoWordWrap = options.wordWrap;
            Settings.MonacoVim = options.vim;
          }}
        />
        <Modal open={ramInfoOpen} onClose={() => setRamInfoOpen(false)}>
          <Table>
            <TableBody>
              {ramEntries.map(([n, r]) => (
                <React.Fragment key={n + r}>
                  <TableRow>
                    <TableCell sx={{ color: Settings.theme.primary }}>{n}</TableCell>
                    <TableCell align="right" sx={{ color: Settings.theme.primary }}>
                      {r}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Modal>
      </div>
      <div
        style={{
          display: currentScript !== null ? "none" : "flex",
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span style={{ color: Settings.theme.primary, fontSize: "20px", textAlign: "center" }}>
          <Typography variant="h4">No open files</Typography>
          <Typography variant="h5">
            Use <code>nano FILENAME</code> in
            <br />
            the terminal to open files
          </Typography>
        </span>
      </div>
    </>
  );
}
