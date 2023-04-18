import { isAbsolutePath } from "../Paths/Directory";
import { FilePath, isFilePath } from "../Paths/FilePath";
import { MessageFilename } from "./MessageHelpers";

export class Message {
  // Name of Message file
  filename: MessageFilename & FilePath;

  // The text contains in the Message
  msg: string;

  constructor(filename: MessageFilename, msg: string) {
    if (!isFilePath(filename) || !isAbsolutePath(filename)) {
      throw new Error(`Error while constructing messages: could not parse ${filename} as file path`);
    }
    this.filename = filename;
    this.msg = msg;
  }
}
