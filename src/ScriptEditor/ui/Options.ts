export type WordWrapOptions = "on" | "off" | "bounded" | "wordWrapColumn";
export type Options = {
  theme: string;
  insertSpaces: boolean;
  tabSize: number;
  detectIndentation: boolean;
  fontFamily: string;
  fontSize: number;
  fontLigatures: boolean;
  wordWrap: WordWrapOptions;
  vim: boolean;
};
