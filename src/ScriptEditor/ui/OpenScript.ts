import type { ContentFilePath } from "../../Paths/ContentFile";
import monaco, { editor, Position } from "monaco-editor";

type ITextModel = editor.ITextModel;

// Holds all the data for a open script
export class OpenScript {
  path: ContentFilePath;
  code: string;
  hostname: string;
  lastPosition: Position;
  model: ITextModel;
  isTxt: boolean;
  // TODO: Adding actual external update notifications for the OpenScript class
  // hasExternalUpdate = false;

  constructor(path: ContentFilePath, code: string, hostname: string, lastPosition: Position, model: ITextModel) {
    this.path = path;
    this.code = code;
    this.hostname = hostname;
    this.lastPosition = lastPosition;
    this.model = model;
    this.isTxt = path.endsWith(".txt");
  }

  regenerateModel(): void {
    const uri = monaco.Uri.from({
      scheme: "file",
      path: `${this.hostname}/${this.path}`,
    });
    //regenerate an existing model or create a new one, just a safety check again we should have disposed it
    this.model =
      monaco.editor.getModel(uri) ?? editor.createModel(this.code, this.isTxt ? "plaintext" : "javascript", uri);
  }
}
