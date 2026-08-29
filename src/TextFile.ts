import type { BaseServer } from "./Server/BaseServer";
import { Generic_fromJSON, Generic_toJSON, type IReviverValue, constructorsForReviver } from "./utils/JSONReviver";
import { stringDataIdx } from "./utils/JSONContext";
import type { TextFilePath } from "./Paths/TextFilePath";
import { ContentFile } from "./Paths/ContentFile";

/** Represents a plain text file that is typically stored on a server. */
export class TextFile extends ContentFile {
  /** The full file name. */
  filename: TextFilePath;

  /** The content of the file. */
  text: string;

  // Shared interface on Script and TextFile for accessing content
  get content() {
    this.metadata.read();
    return this.text;
  }
  set content(text: string) {
    this.metadata.edit();
    this.text = text;
  }

  constructor(filename = "default.txt" as TextFilePath, txt = "") {
    super();
    this.filename = filename;
    this.text = txt;
  }

  deleteFromServer(server: BaseServer): boolean {
    if (!server.textFiles.has(this.filename)) return false;
    server.textFiles.delete(this.filename);
    return true;
  }

  /** Serialize the current file to a JSON save state. */
  toJSON(): IReviverValue {
    const value = Generic_toJSON("TextFile", this) as IReviverValue<TextFile>;
    // Dedup common strings
    value.data.filename = stringDataIdx(value.data.filename) as TextFilePath;
    value.data.text = stringDataIdx(value.data.text);
    return value;
  }

  /** Initializes a TextFile from a JSON save state. */
  static fromJSON(value: IReviverValue, context?: string[]): TextFile {
    context ??= [];
    // This cast is to ensure our writes are type-safe. Our reads are checked
    // via typeof already (and don't conform to the type given).
    const data = (value as IReviverValue<TextFile>).data;
    if (typeof data.filename === "number") {
      data.filename = context[data.filename] as TextFilePath;
    }
    if (typeof data.text === "number") {
      data.text = context[data.text];
    }
    return Generic_fromJSON(TextFile, data);
  }
}

constructorsForReviver.TextFile = TextFile;
