import type { ContentFilePath } from "../../Paths/ContentFile";
import { editor, Position } from "monaco-editor";

type ITextModel = editor.ITextModel;

// Holds all the data for a open script
export class OpenScript {
  path: ContentFilePath;
  code: string;
  hostname: string;
  lastPosition: Position;
  model: ITextModel;
  isTxt: boolean;
  hasExternalUpdate = false;

  constructor(path: ContentFilePath, code: string, hostname: string, lastPosition: Position, model: ITextModel) {
    this.path = path;
    this.code = code;
    this.hostname = hostname;
    this.lastPosition = lastPosition;
    this.model = model;
    this.isTxt = path.endsWith(".txt");
  }

  regenerateModel(): void {
    this.model = editor.createModel(this.code, this.isTxt ? "plaintext" : "javascript");
  }
}
