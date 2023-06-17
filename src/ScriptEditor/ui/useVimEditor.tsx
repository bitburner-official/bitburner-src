import React, { useEffect, useRef, useState } from "react";
// @ts-expect-error This library does not have types.
import * as MonacoVim from "monaco-vim";
import type { editor } from "monaco-editor";
type IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

import Box from "@mui/material/Box";

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";

interface IProps {
  vim: boolean;
  editor: IStandaloneCodeEditor | null;
  onOpenNextTab: (step: number) => void;
  onOpenPreviousTab: (step: number) => void;
  onSave: () => void;
}

export function useVimEditor({ editor, vim, onOpenNextTab, onOpenPreviousTab, onSave }: IProps) {
  // monaco-vim does not have types, so this is an any
  const [vimEditor, setVimEditor] = useState<any>(null);

  const vimStatusRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // setup monaco-vim
    if (vim && editor && !vimEditor) {
      // Using try/catch because MonacoVim does not have types.
      try {
        setVimEditor(MonacoVim.initVimMode(editor, vimStatusRef.current));
        MonacoVim.VimMode.Vim.defineEx("write", "w", function () {
          // your own implementation on what you want to do when :w is pressed
          onSave();
        });
        MonacoVim.VimMode.Vim.defineEx("quit", "q", function () {
          Router.toPage(Page.Terminal);
        });

        const saveNQuit = (): void => {
          onSave();
          Router.toPage(Page.Terminal);
        };
        // "wqriteandquit" &  "xriteandquit" are not typos, prefix must be found in full string
        MonacoVim.VimMode.Vim.defineEx("wqriteandquit", "wq", saveNQuit);
        MonacoVim.VimMode.Vim.defineEx("xriteandquit", "x", saveNQuit);

        // Setup "go to next tab" and "go to previous tab". This is a little more involved
        // since these aren't Ex commands (they run in normal mode, not after typing `:`)
        MonacoVim.VimMode.Vim.defineAction("nextTabs", function (_cm: any, { repeat = 1 }: { repeat?: number }) {
          onOpenNextTab(repeat);
        });
        MonacoVim.VimMode.Vim.defineAction("prevTabs", function (_cm: any, { repeat = 1 }: { repeat?: number }) {
          onOpenPreviousTab(repeat);
        });
        MonacoVim.VimMode.Vim.mapCommand("gt", "action", "nextTabs", {}, { context: "normal" });
        MonacoVim.VimMode.Vim.mapCommand("gT", "action", "prevTabs", {}, { context: "normal" });
        editor.focus();
      } catch (e) {
        console.error("An error occurred while loading monaco-vim:");
        console.error(e);
      }
    } else if (!vim) {
      // When vim mode is disabled
      vimEditor?.dispose();
      setVimEditor(null);
    }

    return () => {
      vimEditor?.dispose();
    };
  }, [vim, editor, vimEditor]);

  const VimStatus = (
    <Box
      ref={vimStatusRef}
      className="vim-display"
      display="flex"
      flexGrow="0"
      flexDirection="row"
      sx={{ p: 1 }}
      alignItems="center"
    />
  );

  return { VimStatus };
}
