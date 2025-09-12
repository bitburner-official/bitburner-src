import React, { useEffect, useRef, useState } from "react";
import * as MonacoVim from "monaco-vim";
import type { editor } from "monaco-editor";
type IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { StatusBar } from "./StatusBar";
import { useRerender } from "../../ui/React/hooks";

interface IProps {
  vim: boolean;
  editor: IStandaloneCodeEditor | null;
  onOpenNextTab: (step: number) => void;
  onOpenPreviousTab: (step: number) => void;
  onSave: () => Promise<void>;
}

export function useVimEditor({ editor, vim, onOpenNextTab, onOpenPreviousTab, onSave }: IProps) {
  const [vimEditor, setVimEditor] = useState<ReturnType<typeof MonacoVim.initVimMode> | null>(null);

  const statusBarRef = useRef<React.ReactElement | null>(null);
  const rerender = useRerender();

  const actionsRef = useRef({ save: onSave, openNextTab: onOpenNextTab, openPreviousTab: onOpenPreviousTab });
  actionsRef.current = { save: onSave, openNextTab: onOpenNextTab, openPreviousTab: onOpenPreviousTab };

  useEffect(() => {
    // setup monaco-vim
    if (vim && editor && !vimEditor) {
      try {
        setVimEditor(MonacoVim.initVimMode(editor, statusBarRef, StatusBar, rerender));
        MonacoVim.VimMode.Vim.defineEx("write", "w", function () {
          // your own implementation on what you want to do when :w is pressed
          actionsRef.current.save().catch((error) => console.error(error));
        });
        MonacoVim.VimMode.Vim.defineEx("quit", "q", function () {
          Router.toPage(Page.Terminal);
        });

        // Remove any macro recording, since it isn't supported.
        MonacoVim.VimMode.Vim.mapCommand("q", "", "", null, { context: "normal" });
        MonacoVim.VimMode.Vim.mapCommand("@", "", "", null, { context: "normal" });

        const saveNQuit = (): void => {
          actionsRef.current
            .save()
            .then(() => {
              Router.toPage(Page.Terminal);
            })
            .catch((error) => console.error(error));
        };
        // "wqriteandquit" &  "xriteandquit" are not typos, prefix must be found in full string
        MonacoVim.VimMode.Vim.defineEx("wqriteandquit", "wq", saveNQuit);
        MonacoVim.VimMode.Vim.defineEx("xriteandquit", "x", saveNQuit);

        // Setup "go to next tab" and "go to previous tab". This is a little more involved
        // since these aren't Ex commands (they run in normal mode, not after typing `:`)
        MonacoVim.VimMode.Vim.defineAction("nextTabs", function (_cm: any, { repeat = 1 }: { repeat?: number }) {
          actionsRef.current.openNextTab(repeat);
        });
        MonacoVim.VimMode.Vim.defineAction("prevTabs", function (_cm: any, { repeat = 1 }: { repeat?: number }) {
          actionsRef.current.openPreviousTab(repeat);
        });
        MonacoVim.VimMode.Vim.mapCommand("gt", "action", "nextTabs", {}, { context: "normal" });
        MonacoVim.VimMode.Vim.mapCommand("gT", "action", "prevTabs", {}, { context: "normal" });
        editor.focus();
      } catch (e) {
        console.error("An error occurred while loading monaco-vim:", e);
      }
    } else if (!vim) {
      // When vim mode is disabled
      vimEditor?.dispose();
      setVimEditor(null);
    }

    return () => {
      vimEditor?.dispose();
    };
  }, [vim, editor, vimEditor, rerender]);

  return { statusBarRef };
}
