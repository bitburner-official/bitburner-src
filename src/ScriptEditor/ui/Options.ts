import type { editor } from "monaco-editor";

export type WordWrapOptions = "on" | "off" | "bounded" | "wordWrapColumn";

export type CursorStyle = editor.IEditorOptions["cursorStyle"];
export type CursorBlinking = editor.IEditorOptions["cursorBlinking"];

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
}
