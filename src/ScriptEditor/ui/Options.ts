export type WordWrapOptions = "on" | "off" | "bounded" | "wordWrapColumn";
export interface Options {
  theme: string;
  insertSpaces: boolean;
  tabSize: number;
  detectIndentation: boolean;
  fontFamily: string;
  fontSize: number;
  fontLigatures: boolean;
  wordWrap: WordWrapOptions;
  vim: boolean;
}
