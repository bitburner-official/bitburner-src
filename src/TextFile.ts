import { BaseServer } from "./Server/BaseServer";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "./utils/JSONReviver";
import { TextFilePath } from "./Paths/TextFilePath";
import { ContentFile } from "./Paths/ContentFile";
import { FileMetadata } from "./Paths/FileMetadata";

/** Represents a plain text file that is typically stored on a server. */
export class TextFile implements ContentFile {
  /** The full file name. */
  filename: TextFilePath;

  /** The content of the file. */
  text: string;

  // Used for the Remote File API,
  // to resolve conflicts when synchronizing files outside the game
  metadata: FileMetadata;

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
    this.filename = filename;
    this.text = txt;
    this.metadata = new FileMetadata();
  }

  /** Serialize the current file to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("TextFile", this);
  }

  deleteFromServer(server: BaseServer): boolean {
    if (!server.textFiles.has(this.filename)) return false;
    server.textFiles.delete(this.filename);
    return true;
  }

  /** Initializes a TextFile from a JSON save state. */
  static fromJSON(value: IReviverValue): TextFile {
    return Generic_fromJSON(TextFile, value.data);
  }
}

constructorsForReviver.TextFile = TextFile;
