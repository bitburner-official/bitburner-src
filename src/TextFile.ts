import { dialogBoxCreate } from "./ui/React/DialogBox";
import { BaseServer } from "./Server/BaseServer";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "./utils/JSONReviver";
import { TextFilePath } from "./Paths/TextFilePath";
import { ContentFile } from "./Files/ContentFile";

/** Represents a plain text file that is typically stored on a server. */
export class TextFile implements ContentFile {
  /** The full file name. */
  filename: TextFilePath;

  /** The content of the file. */
  text: string;

  // Shared interface on Script and TextFile for accessing content
  get content() {
    return this.text;
  }
  set content(text: string) {
    this.text = text;
  }

  constructor(filename = "default.txt" as TextFilePath, txt = "") {
    this.filename = filename;
    this.text = txt;
  }

  /** Concatenates the raw values to the end of current content. */
  append(txt: string): void {
    this.text += txt;
  }

  /** Serves the file to the user as a downloadable resource through the browser. */
  download(): void {
    const file: Blob = new Blob([this.text], { type: "text/plain" });
    const a: HTMLAnchorElement = document.createElement("a");
    const url: string = URL.createObjectURL(file);
    a.href = url;
    a.download = this.filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  /** Retrieve the content of the file. */
  read(): string {
    return this.text;
  }

  /** Shows the content to the user via the game's dialog box. */
  show(): void {
    dialogBoxCreate(`${this.filename}\n\n${this.text}`);
  }

  /** Serialize the current file to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("TextFile", this);
  }

  /** Replaces the current content with the text provided. */
  write(txt: string): void {
    this.text = txt;
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
