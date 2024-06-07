import type { ContentFilePath } from "../../Paths/ContentFile";
import { editor, Position } from "monaco-editor";
import { makeModel } from "./utils";
import { hasTextExtension } from "../../Paths/TextFilePath";

type ITextModel = editor.ITextModel;

// Holds all the data for a open script
export class OpenScript {
  path: ContentFilePath;
  code: string;
  hostname: string;
  lastPosition: Position;
  model: ITextModel;
  vimMode: boolean;
  isTxt: boolean;
  // TODO: Adding actual external update notifications for the OpenScript class
  // hasExternalUpdate = false;

  constructor(
    path: ContentFilePath,
    code: string,
    hostname: string,
    lastPosition: Position,
    model: ITextModel,
    vimMode: boolean,
  ) {
    this.path = path;
    this.code = code;
    this.hostname = hostname;
    this.lastPosition = lastPosition;
    this.model = model;
    this.vimMode = vimMode;
    this.isTxt = hasTextExtension(path);
  }

  regenerateModel(): void {
    this.model = makeModel(this.hostname, this.path, this.code);
  }
}
