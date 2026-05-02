import type { editor } from "monaco-editor";

export type WordWrapOptions = "on" | "off" | "bounded" | "wordWrapColumn";

export type CursorStyle = editor.IEditorOptions["cursorStyle"];
export type CursorBlinking = editor.IEditorOptions["cursorBlinking"];
export type StickyScroll = editor.IEditorOptions["stickyScroll"];
export type Minimap = editor.IEditorOptions["minimap"];

export interface Options {
  theme: string;
  insertSpaces: boolean;
  tabSize: number;
  detectIndentation: boolean;
  fontFamily: string;
  fontSize: number;
  fontLigatures: boolean;
  wordWrap: WordWrapOptions;
  cursorStyle: CursorStyle;
  cursorBlinking: CursorBlinking;
  beautifyOnSave: boolean;
  stickyScroll: StickyScroll;
  minimap: Minimap;
  autoSaveOnFocusChange: boolean;
}
